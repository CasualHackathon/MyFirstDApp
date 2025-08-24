// API route to proxy model downloads with proper authorization
import { NextRequest, NextResponse } from 'next/server';

// 使用服务端私密环境变量（不要在客户端暴露）
const MESHY_API_KEY = process.env.MESHY_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelUrl = searchParams.get('url');

  console.log('🌐 API Route - Download model request:', {
    modelUrl,
    hasApiKey: !!MESHY_API_KEY,
    apiKeyLength: MESHY_API_KEY?.length
  });

  if (!modelUrl) {
    console.error('❌ API Route - Missing model URL');
    return NextResponse.json({ error: 'Missing model URL' }, { status: 400 });
  }

  // 不强制要求 API KEY：对于已签名的公开URL（带 Signature/Key-Pair-Id）通常无需鉴权

  try {
    console.log('📡 API Route - Starting streaming download for:', modelUrl);

    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ API Route - Request timeout after 300 seconds');
      controller.abort();
    }, 300000); // 300秒超时（5分钟）

    // 先尝试无鉴权直连；若 401 且有 KEY 再带鉴权重试
    let response = await fetch(modelUrl, {
      headers: { 'User-Agent': 'NextJS-Proxy/1.0' },
      signal: controller.signal,
    });
    if (response.status === 401 && MESHY_API_KEY) {
      console.warn('🔁 Unauthorized without key, retrying with Authorization header');
      response = await fetch(modelUrl, {
        headers: {
          Authorization: `Bearer ${MESHY_API_KEY}`,
          'User-Agent': 'NextJS-Proxy/1.0',
        },
        signal: controller.signal,
      });
    }

    // 清除超时定时器
    clearTimeout(timeoutId);

    console.log('📡 API Route - Upstream response:', {
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      console.error(
        '❌ API Route - Proxy download failed:',
        response.status,
        response.statusText
      );
      
      const errorText = await response.text();
      console.error('❌ API Route - Error response body:', errorText);
      
      return NextResponse.json(
        { error: `Download failed: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    console.log(
      '✅ API Route - Starting stream transfer:',
      {
        contentType,
        contentLength: contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB` : 'unknown',
        url: modelUrl
      }
    );

    // 使用流式传输而不是blob
    // 直接传递响应体流，避免内存缓冲
    if (!response.body) {
      throw new Error('Response body is not available');
    }

    // 创建一个 TransformStream 来监控传输进度（可选）
    let transferredBytes = 0;
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        transferredBytes += chunk.byteLength;
        // 每传输1MB记录一次
        if (transferredBytes % (1024 * 1024) < chunk.byteLength) {
          console.log(`📊 Streaming progress: ${(transferredBytes / 1024 / 1024).toFixed(2)}MB transferred`);
        }
        controller.enqueue(chunk);
      },
      flush() {
        console.log(`✅ Stream complete: ${(transferredBytes / 1024 / 1024).toFixed(2)}MB total`);
      }
    });

    // 将原始响应流通过转换流
    const streamedBody = response.body.pipeThrough(transformStream);

    return new NextResponse(streamedBody, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || '',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        // 添加流式传输提示
        'X-Content-Type-Options': 'nosniff',
        'X-Stream-Transfer': 'true',
      },
    });
  } catch (error) {
    console.error('❌ API Route - Proxy error:', error);
    
    // 处理特定错误类型
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ API Route - Request timed out');
        return NextResponse.json(
          { error: 'Request timeout', details: 'The download request timed out after 300 seconds' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('fetch failed')) {
        console.error('❌ API Route - Network error:', error.message);
        return NextResponse.json(
          { error: 'Network error', details: 'Failed to connect to Meshy API' },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
