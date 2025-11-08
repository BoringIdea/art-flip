import Link from "next/link"
import { Github, MessageSquare, X } from "lucide-react"

export default function Footer() {
  return (
    <footer className="flex justify-center items-center p-2 sm:p-4 sm:pl-[110px] border-t border-gray-800 bg-[#141414] fixed bottom-0 left-0 right-0 z-10">
      <div className="flex gap-2 sm:gap-4">
        <Link href="https://github.com/HashIdea" className="text-gray-400 hover:text-white">
          <Github className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
        <Link href="https://x.com/flip_io" className="text-gray-400 hover:text-white">
          <img className="w-4 sm:w-5" src="/x.svg" alt="x" />
        </Link>
        <Link href="https://flipnft.gitbook.io/flip-docs" className="text-gray-400 hover:text-white">
          <img className="w-4 sm:w-5" src="/docs.svg" alt="docs" />
        </Link>
      </div>
    </footer>
  )
}
