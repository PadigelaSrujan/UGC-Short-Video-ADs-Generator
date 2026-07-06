import { useEffect, useState, useRef } from "react";
import type { Project } from "../types";
import { Loader2, RefreshCwIcon, ImageIcon, VideoIcon, SparkleIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import api from "../configs/axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
const Results = () => {
  const { projectID } = useParams();
  const navigate = useNavigate();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [project, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProjectData = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/api/user/projects/${projectID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjectData(data.project);
      setIsGenerating(data.project.isGenerating);
      setLoading(false);
      return data.project;
    } catch (error) {
      toast.error("Failed to fetch project data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!project?.id) {
      toast.error("Project not found");
      return;
    }

    try {
      setIsGenerating(true);
      const token = await getToken();
      const { data } = await api.post("/api/project/generate-video", {
        projectId: project.id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Video generated successfully!");
      setProjectData((prev) =>
        prev
          ? {
              ...prev,
              generatedVideo: data.videoUrl,
              isGenerating: false,
            }
          : null
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate video"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Main effect: fetch project data on mount
  useEffect(() => {
    if (isSignedIn && projectID) {
      fetchProjectData();
    } else if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, isLoaded, projectID]);

  // Polling effect: poll while the project is generating
  useEffect(() => {
    if (isGenerating && isSignedIn) {
      pollingRef.current = setInterval(async () => {
        const updated = await fetchProjectData();
        if (updated && !updated.isGenerating) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }, 10000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isGenerating, isSignedIn]);

  // ================= LOADING SCREEN =================
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 size-9" />
      </div>
    );
  }

  // ================= MAIN CONTENT =================
  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Generation Details
          </h1>

          <Link
            to="/my-generations"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            <p className="max-sm:hidden">
              View information about your selected generation
            </p>
          </Link>
        </header>

        {/* CONTENT GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* MEDIA SECTION */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel inline-block p-2 rounded-2xl">
              
              <div
                className={`${
                  project?.aspectRatio === "9:16"
                    ? "aspect-[9/16]"
                    : "aspect-video"
                } sm:max-h-[800px] rounded-xl bg-gray-900 overflow-hidden relative`}
              >
                {project?.generatedVideo ? (
                  <video
                    src={project.generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={project?.generatedImage || ""}
                    alt="Generated Result"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar Actions */}
          {project && (
            <div className="space-y-6">

              {/* download buttons  */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">Actions</h3>
                <div className="flex flex-col gap-3">
                  {project.generatedImage && (
                    <a href={project.generatedImage.replace("/upload", "/upload/fl_attachment")} download>
                      <GhostButton  disabled={!project.generatedImage} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ImageIcon className="size-4" />
                        Download Image
                      </GhostButton>
                    </a>
                  )}
                  {project.generatedVideo && (
                    <a href={project.generatedVideo.replace("/upload", "/upload/fl_attachment")} download>
                      <GhostButton  disabled={!project.generatedVideo} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        <VideoIcon className="size-4" />
                        Download Video
                      </GhostButton>
                    </a>
                  )}
                </div>
              </div>

              {/* Generate Video Button */}
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <VideoIcon className="size-24" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Video Magic</h3>
                <p className="text-gray-400 text-sm mb-6">Turn this static image into a dynamic video for social media.</p>
                <PrimaryButton onClick={handleGenerateVideo} disabled={isGenerating || project.isGenerating} className="w-full">
                  {isGenerating || project.isGenerating ? (
                    <>Generating Video...</>
                  ) : (
                    <>
                      <SparkleIcon className="size-4" /> Generate Video
                    </>
                  )}
                </PrimaryButton>
                {project.generatedVideo && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium mt-4">
                    Video Generated Successfully!
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* PROJECT DETAILS */}
        {project && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-8">
            <h2 className="text-xl font-medium mb-2">
              {project.productName || "Untitled project"}
            </h2>

            {project.productDescription && (
              <p className="text-sm text-gray-300">
                {project.productDescription}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
