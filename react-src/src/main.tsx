import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

type BootWindow = Window & {
  __APP_BOOTED__?: boolean;
  __BOOT_TIMER__?: ReturnType<typeof setTimeout>;
};

const rootElement = document.getElementById("root");
const bootWindow = window as BootWindow;
const hasBooted = () => Boolean(bootWindow.__APP_BOOTED__);

const renderFatal = (title: string, error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  const target = rootElement || document.body;
  target.innerHTML = `
    <div style="padding:16px;font-family:system-ui, sans-serif;color:#1f2937;">
      <h2 style="margin:0 0 8px 0;color:#b91c1c;">${title}</h2>
      <pre style="white-space:pre-wrap;background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:8px;">${message}</pre>
    </div>
  `;
};

import React, { Component, ErrorInfo } from "react";

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error ? (this.state.error.stack || this.state.error.message) : 'Unknown Error';
      return (
        <div style={{padding: '16px', fontFamily: 'system-ui, sans-serif', color: '#1f2937'}}>
          <h2 style={{margin: '0 0 8px 0', color: '#b91c1c'}}>React组件渲染错误 (ErrorBoundary)</h2>
          <pre style={{whiteSpace: 'pre-wrap', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px'}}>{message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

window.addEventListener("error", (event) => {
  console.error("[RuntimeError]", event.error || event.message);
  // 如果已成功启动且只是非致命报错（如无害第三方脚本或已捕获事件），避免替换整个界面
  if (!hasBooted()) {
    renderFatal("全局运行时错误", event.error || event.message);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[RuntimeUnhandledRejection]", event.reason);
  if (!hasBooted()) {
    renderFatal("全局 Promise 错误", event.reason);
  }
});

if (!rootElement) {
  renderFatal("应用启动出错", "找不到 #root 节点");
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    bootWindow.__APP_BOOTED__ = true;
    if (bootWindow.__BOOT_TIMER__) {
      clearTimeout(bootWindow.__BOOT_TIMER__);
    }
    const bootStatus = document.getElementById("boot-status");
    if (bootStatus) {
      bootStatus.remove();
    }
  } catch (error) {
    renderFatal("应用启动同步出错", error);
  }
}
