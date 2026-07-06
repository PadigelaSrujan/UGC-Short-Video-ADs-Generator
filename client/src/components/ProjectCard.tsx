import React from "react";
import type { Project } from "../types";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { EllipsisIcon } from "lucide-react";
import { GhostButton, PrimaryButton } from "./Buttons";
import api from "../configs/axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

const ProjectCard = ({
  gen,
  setGenerations,
  forCommunity = false,
}: {
  gen: Project;
  setGenerations: React.Dispatch<React.SetStateAction<Project[]>>;
  forCommunity?: boolean;
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDownloadImage = () => {
    if (!gen.generatedImage) return;

    try {
      const link = document.createElement("a");
      link.href = gen.generatedImage;

      const safeName = gen.productName
        ? gen.productName.toString().trim().replace(/\s+/g, "-").toLowerCase()
        : "";

      link.download =
        (safeName ? `${safeName}-${gen.id}` : `generation-${gen.id}`) +
        ".png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(gen.generatedImage, "_blank");
    }
  };

  const handleDownloadVideo = () => {
    if (!gen.generatedVideo) return;

    try {
      const link = document.createElement("a");
      link.href = gen.generatedVideo;

      const safeName = gen.productName
        ? gen.productName.toString().trim().replace(/\s+/g, "-").toLowerCase()
        : "";

      link.download =
        (safeName ? `${safeName}-${gen.id}` : `generation-${gen.id}`) +
        ".mp4";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(gen.generatedVideo, "_blank");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/result/${gen.id}`;
    const title = gen.productName || "UGC Generation";
    const text = gen.productDescription || "";

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } else {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to share this generation");
    }
  };

  const { getToken } = useAuth();

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirm) return;

    try {
      const token = await getToken();
      const { data } = await api.delete(`/api/project/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGenerations((generations) =>
        generations.filter((g) => g.id !== id)
      );

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  const togglePublish = async (projectId: string) => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/user/projects/${projectId}/toggle-public`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGenerations((generations) =>
        generations.map((g) =>
          g.id === projectId
            ? { ...g, isPublished: data.project.isPublished }
            : g
        )
      );

      toast.success(
        data.isPublished ? "Project published" : "Project unpublished"
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">
        
        {/* Preview */}
        <div
          className={`${
            gen?.aspectRatio === "9:16"
              ? "aspect-[9/16]"
              : "aspect-video"
          } relative overflow-hidden`}
        >
          {/* Image */}
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName}
              className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${
                gen.generatedVideo
                  ? "group-hover:opacity-0"
                  : "group-hover:scale-105"
              }`}
            />
          )}

          {/* Video */}
          {gen.generatedVideo && (
            <video
              src={gen.generatedVideo}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}

          {/* Loader */}
          {!gen.generatedImage && !gen.generatedVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="size-7 animate-spin" />
            </div>
          )}

          {/* Status badges */}
          <div className="absolute left-3 top-3 flex gap-2 items-center">
            {gen.isGenerating && (
              <span className="text-xs px-2 py-1 bg-yellow-600/30 rounded-full">
                Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="text-xs px-2 py-1 bg-green-600/30 rounded-full">
                Published
              </span>
            )}
          </div>

          {/* Action menu (three dots) - visible on hover in all views */}
          <div className="absolute right-3 top-3 flex items-center opacity-0 group-hover:opacity-100 transition">
            <button
              type="button"
              className="bg-black/60 hover:bg-black/80 rounded-full p-1 text-white transition"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <EllipsisIcon className="size-5" />
            </button>

            {menuOpen && (
              <ul className="absolute right-0 top-8 w-40 bg-black/80 backdrop-blur text-xs text-white border border-gray-500/50 rounded-lg shadow-md py-1 z-10">
                {/* Always available */}
                <li>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-white/10"
                    onClick={() => {
                      navigate(`/result/${gen.id}`);
                      scrollTo(0, 0);
                      setMenuOpen(false);
                    }}
                  >
                    👁 View details
                  </button>
                </li>

                {gen.generatedImage && (
                  <li>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-white/10"
                      onClick={() => {
                        handleDownloadImage();
                        setMenuOpen(false);
                      }}
                    >
                      🖼️ Download image
                    </button>
                  </li>
                )}

                {gen.generatedVideo && (
                  <li>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-white/10"
                      onClick={() => {
                        handleDownloadVideo();
                        setMenuOpen(false);
                      }}
                    >
                      🎬 Download video
                    </button>
                  </li>
                )}

                {/* Share - available everywhere */}
                <li>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-white/10"
                    onClick={() => {
                      handleShare();
                      setMenuOpen(false);
                    }}
                  >
                    🔗 Share
                  </button>
                </li>

                {/* Delete - available everywhere (backend can enforce permissions) */}
                <li>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-900/40"
                    onClick={() => {
                      handleDelete(gen.id);
                      setMenuOpen(false);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </li>

                {/* Only for My Generations (not Community) */}
                {!forCommunity && (
                  <li>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-white/10"
                      onClick={() => {
                        togglePublish(gen.id);
                        setMenuOpen(false);
                      }}
                    >
                      {gen.isPublished ? "📢 Unpublish" : "📢 Publish"}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Source images */}
          {gen.uploadedImages?.length! >= 2 && (
            <div className={`absolute right-3 ${!forCommunity ? "bottom-20" : "bottom-3"} flex`}>
              <img
                src={gen.uploadedImages![0]}
                alt="product"
                className="w-16 h-16 object-cover rounded-full animate-float"
              />
              <img
                src={gen.uploadedImages![1]}
                alt="model"
                className="w-16 h-16 object-cover rounded-full animate-float -ml-8"
                style={{ animationDelay: "3s" }}
              />
            </div>
          )}

          {/* Bottom overlay actions (publish only for My Generations) */}
          {!forCommunity && (
            <div className="absolute inset-x-3 bottom-3 flex">
              <PrimaryButton
                onClick={() => togglePublish(gen.id)}
                className="w-full text-xs rounded-md"
              >
                {gen.isPublished ? "Unpublish" : "Publish"}
              </PrimaryButton>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">
                {gen.productName}
              </h3>

              <p className="text-sm text-gray-400">
                Created: {new Date(gen.createdAt).toLocaleString()}
              </p>

              {gen.updatedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated:{" "}
                  {new Date(gen.updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <span className="text-xs px-2 py-1 bg-white/5 rounded-full">
              Aspect: {gen.aspectRatio}
            </span>
          </div>

          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">
                Description
              </p>
              <div className="text-sm text-gray-300 bg-white/3 p-2 rounded-md break-words">
                {gen.productDescription}
              </div>
            </div>
          )}

          {gen.userPrompt && (
            <div className="mt-3 text-xs text-gray-300">
              {gen.userPrompt}
            </div>
          )}

          {/* View details button after description */}
          <div className="mt-4">
            <GhostButton
              className="w-full text-xs justify-center"
              onClick={() => {
                navigate(`/result/${gen.id}`);
                scrollTo(0, 0);
              }}
            >
              View Details
            </GhostButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
