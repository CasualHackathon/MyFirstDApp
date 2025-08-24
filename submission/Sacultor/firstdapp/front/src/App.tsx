import { useState, useEffect } from "react";
import { Navbar, Footer, NoteBoard, CalendarWidget, NoteEditorModal } from "./components";
import styles from "./styles/PixelLogo.module.css";
import "./App.css";
import CursorFireworks from "./components/CursorFireworks";
import './styles/cursor-fireworks.css';

const dApp = () => {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="container">
      <div className="hero">
        <PixelLogo text="EVERYFIRST" />
      </div>
      <div className="card navbar" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,246,250,0.9))' }}>
        <Navbar onAdd={() => setEditorOpen(true)} />
      </div>
      <div className="layout" style={{ marginTop: 16 }}>
        <div>
          <NoteBoard onAdd={() => setEditorOpen(true)} />
        </div>
        <aside>
          <div className="card" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,244,248,0.92))' }}>
            <CalendarWidget />
          </div>
        </aside>
      </div>
      <div className="card footer" style={{ marginTop: 20, background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,244,248,0.9))' }}>
        <Footer />
      </div>
      {editorOpen && (
        <NoteEditorModal onClose={() => setEditorOpen(false)} />
      )}
    </div>
  )
}

// 像素风格Logo组件
const PixelLogo = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [showDecorations, setShowDecorations] = useState(false);
  
  useEffect(() => {
    // 打字机效果
    let currentIndex = 0;
    const typingSpeed = 150; // 控制打字速度(毫秒)
    
    const typeNextCharacter = () => {
      if (currentIndex <= text.length) {
        setDisplayText(text.substring(0, currentIndex));
        currentIndex++;
        setTimeout(typeNextCharacter, typingSpeed);
      } else {
        // 打字完成后显示装饰元素并开始浮动动画
        setShowDecorations(true);
        const logoElement = document.querySelector(`.${styles.pixelLogo}`);
        if (logoElement) {
          logoElement.classList.add(styles.floatAnimation);
        }
      }
    };
    
    typeNextCharacter();
    
    return () => {
      // 清理定时器
      currentIndex = text.length + 1;
    };
  }, [text]);
  
  return (
    <div className={`${styles.pixelLogo} ${styles.typingEffect}`}>
      {displayText}
      {showDecorations && (
        <div className={styles.decorations}>
          <div className={`${styles.orbit} ${styles.star1}`} style={{
            width: 'var(--size)',
            height: 'var(--size)',
            marginLeft: 'calc(-1 * var(--size) / 2)',
            marginTop: 'calc(-1 * var(--size) / 2)'
          }}>
            <span className={`${styles.decoration} ${styles.star} ${styles.star1}`} style={{
              animation: `${styles.orbit} var(--duration) linear infinite`,
              animationDelay: 'var(--delay)'
            }}>✦</span>
          </div>
          
          <div className={`${styles.orbit} ${styles.star2}`} style={{
            width: 'var(--size)',
            height: 'var(--size)',
            marginLeft: 'calc(-1 * var(--size) / 2)',
            marginTop: 'calc(-1 * var(--size) / 2)'
          }}>
            <span className={`${styles.decoration} ${styles.star} ${styles.star2}`} style={{
              animation: `${styles.reverseOrbit} var(--duration) linear infinite`,
              animationDelay: 'var(--delay)'
            }}>✧</span>
          </div>
          
          <div className={`${styles.orbit} ${styles.star3}`} style={{
            width: 'var(--size)',
            height: 'var(--size)',
            marginLeft: 'calc(-1 * var(--size) / 2)',
            marginTop: 'calc(-1 * var(--size) / 2)'
          }}>
            <span className={`${styles.decoration} ${styles.star} ${styles.star3}`} style={{
              animation: `${styles.orbit} var(--duration) linear infinite`,
              animationDelay: 'var(--delay)'
            }}>✧</span>
          </div>
          
          <div className={`${styles.orbit} ${styles.moon1}`} style={{
            width: 'var(--size)',
            height: 'var(--size)',
            marginLeft: 'calc(-1 * var(--size) / 2)',
            marginTop: 'calc(-1 * var(--size) / 2)'
          }}>
            <span className={`${styles.decoration} ${styles.moon} ${styles.moon1}`} style={{
              animation: `${styles.reverseOrbit} var(--duration) linear infinite`,
              animationDelay: 'var(--delay)'
            }}>☾</span>
          </div>
          
          <div className={`${styles.orbit} ${styles.moon2}`} style={{
            width: 'var(--size)',
            height: 'var(--size)',
            marginLeft: 'calc(-1 * var(--size) / 2)',
            marginTop: 'calc(-1 * var(--size) / 2)'
          }}>
            <span className={`${styles.decoration} ${styles.moon} ${styles.moon2}`} style={{
              animation: `${styles.orbit} var(--duration) linear infinite`,
              animationDelay: 'var(--delay)'
            }}>☽</span>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="app">
      {/* 仅添加这一行，放在最顶层 */}
      <CursorFireworks />
    </div>
  );
}

export default dApp;
