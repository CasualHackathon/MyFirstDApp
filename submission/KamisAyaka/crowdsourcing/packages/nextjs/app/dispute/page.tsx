"use client";

import Link from "next/link";
import { AdminPanel } from "./_components/AdminPanel";
import { DisputeList } from "./_components/DisputeList";

/**
 * 纠纷解决中心主页面
 */
export default function DisputePage() {
  return (
    <div className="flex flex-col items-center pt-10 px-4 min-h-screen bg-base-200">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">纠纷解决中心</h1>
          <div className="flex gap-2">
            <Link href="/dispute/stake" className="btn btn-sm btn-primary">
              管理质押
            </Link>
            <Link href="/" className="btn btn-sm btn-outline btn-primary">
              ← 返回首页
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AdminPanel />
          <DisputeList />
        </div>
      </div>
    </div>
  );
}
