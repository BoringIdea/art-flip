import Link from "next/link"
import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="flex justify-center items-center px-3 sm:px-6 py-2 border-t border-primary bg-background text-secondary text-[11px] tracking-[0.3em] fixed bottom-0 left-0 right-0 z-10">
      <div className="flex gap-2 sm:gap-4">
        <Link href="https://github.com/HashIdea" className="flex h-8 w-8 items-center justify-center border border-border text-secondary hover:text-flip-primary hover:border-flip-primary transition-colors">
          <Github className="w-4 h-4" />
        </Link>
        <Link href="https://x.com/flip_io" className="flex h-8 w-8 items-center justify-center border border-border text-secondary hover:text-flip-primary hover:border-flip-primary transition-colors">
          <img className="w-4" src="/x.svg" alt="x" />
        </Link>
        <Link href="https://flipnft.gitbook.io/flip-docs" className="flex h-8 w-8 items-center justify-center border border-border text-secondary hover:text-flip-primary hover:border-flip-primary transition-colors">
          <img className="w-4" src="/docs.svg" alt="docs" />
        </Link>
      </div>
    </footer>
  )
}
