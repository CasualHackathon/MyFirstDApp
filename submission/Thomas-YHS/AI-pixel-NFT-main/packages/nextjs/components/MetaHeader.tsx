"use client";

import { useEffect } from "react";

interface MetaHeaderProps {
  title: string;
  description: string;
  imageUrl?: string;
}

export const MetaHeader = ({ title, description, imageUrl }: MetaHeaderProps) => {
  useEffect(() => {
    // 动态更新document title
    document.title = title;

    // 更新meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    // 更新Open Graph tags
    const updateOrCreateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (metaTag) {
        metaTag.setAttribute("content", content);
      } else {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("property", property);
        metaTag.setAttribute("content", content);
        document.head.appendChild(metaTag);
      }
    };

    updateOrCreateMetaTag("og:title", title);
    updateOrCreateMetaTag("og:description", description);
    if (imageUrl) {
      updateOrCreateMetaTag("og:image", imageUrl);
    }

    // 更新Twitter Card tags
    const updateOrCreateTwitterTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (metaTag) {
        metaTag.setAttribute("content", content);
      } else {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", name);
        metaTag.setAttribute("content", content);
        document.head.appendChild(metaTag);
      }
    };

    updateOrCreateTwitterTag("twitter:title", title);
    updateOrCreateTwitterTag("twitter:description", description);
    if (imageUrl) {
      updateOrCreateTwitterTag("twitter:image", imageUrl);
    }
  }, [title, description, imageUrl]);

  return null; // 这个组件不渲染任何内容
};
