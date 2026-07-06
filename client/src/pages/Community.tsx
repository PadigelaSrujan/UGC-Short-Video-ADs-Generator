import { useEffect, useState } from "react"
import type { Project } from "../types"
import { Loader2 } from "lucide-react"
import ProjectCard from "../components/ProjectCard"
import api from "../configs/axios"
import toast from "react-hot-toast"
import { dummyGenerations } from "../assets/assets"

const Community = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackProjects: Project[] = dummyGenerations.map((gen: any) => ({
    ...gen,
    // Map static asset fields to the shape expected by ProjectCard
    generateImage: gen.generatedImage,
    generateVideo: gen.generatedVideo,
  }))

  const fetchProjects = async () => {
    try {
      setLoading(true)

      const { data } = await api.get("/api/project/published")

      if (data?.projects?.length) {
        setProjects(data.projects)
      } else {
        // If backend returns nothing, show static assets instead
        setProjects(fallbackProjects)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
      // On error, also fall back to static assets
      setProjects(fallbackProjects)
    } finally {
      setLoading(false)
    }
  }



  useEffect(()=>{
    fetchProjects()
  },[])

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className='size-7 animate-spin text-indigo-400'/>
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">Community</h1>
          <p className="text-gray-400">See what others are creating with UGC.ai</p>
        </header>

        {/* projects list  */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {projects.map((project)=>(
              <ProjectCard key={project.id} gen={project} setGenerations={setProjects} forCommunity={true}/>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Community
