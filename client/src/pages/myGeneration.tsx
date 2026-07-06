import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2 } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import { PrimaryButton } from "../components/Buttons";
import api from "../configs/axios";
import toast from "react-hot-toast";
import { dummyGenerations } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";

const MyGenerations = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackGenerations: Project[] = dummyGenerations.map((gen: any) => ({
    ...gen,
    generatedImage: gen.generatedImage,
    generatedVideo: gen.generatedVideo,
  }));

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get("/api/user/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.projects?.length) {
        setGenerations(data.projects);
      } else {
        setGenerations(fallbackGenerations);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
      setGenerations(fallbackGenerations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/');
    } else {
      fetchGenerations();
    }
  }, [isLoaded, user, navigate]);

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="size-7 animate-spin text-indigo-400" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-2">
              My Generations
            </h1>
            <p className="text-gray-400">
              See what others are creating with UGC.ai
            </p>
          </div>

          <PrimaryButton onClick={() => navigate("/generate")}>
            Create New Generation
          </PrimaryButton>
        </header>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {generations.map((generation) => (
            <ProjectCard
              key={generation.id}
              gen={generation}
              setGenerations={setGenerations}
              forCommunity={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyGenerations;
