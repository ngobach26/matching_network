import Link from "next/link"
import { Button } from "@/components/ui/button"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Find Your Perfect Match</h1>
        <p className={styles.subtitle}>Connect with people who share your interests and preferences</p>
        <div className={styles.buttons}>
          <Button asChild size="lg">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

