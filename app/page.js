import VideoIntro from "../components/VideoIntro/VideoIntro";
import Showcase from "../components/Showcase/Showcase";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.heroWrapper}>
        <VideoIntro />
      </div>

      <section id="next-section" className={styles.nextSection}>
        <Showcase />
      </section>
    </main>
  );
}
