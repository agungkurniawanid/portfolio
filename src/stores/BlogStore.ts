import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Blog } from "@/types/blog"
import { DEVELOPER_BLOGS } from "@/data/blogData"

interface BlogState {
  blogs: Blog[]
  addBlog: (blog: Blog) => void
  getBlogById: (id: string) => Blog | undefined
}

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      blogs: DEVELOPER_BLOGS,
      addBlog: (blog) =>
        set((state) => ({
          blogs: [blog, ...state.blogs],
        })),
      getBlogById: (id) => get().blogs.find((b) => b.id === id),
    }),
    {
      name: "blog-store",
      skipHydration: true,
      // Merge persisted visitor blogs with hardcoded developer blogs on hydration
      merge: (persisted: unknown, current: BlogState) => {
        const persistedState = persisted as BlogState | null
        if (!persistedState) return current
        const visitorBlogs = (persistedState.blogs || []).filter(
          (b) => b.author.type === "visitor"
        )
        return {
          ...current,
          blogs: [...visitorBlogs, ...DEVELOPER_BLOGS],
        }
      },
    }
  )
)
