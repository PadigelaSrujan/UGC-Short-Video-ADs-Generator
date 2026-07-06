
import { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";
import { Loader2Icon, RectangleHorizontalIcon, RectangleVerticalIcon, Wand2Icon } from "lucide-react";
import { PrimaryButton } from "../components/Buttons";
import { useNavigate } from "react-router-dom";
import api from "../configs/axios";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/clerk-react";

const Generator = () => {

    const {user}=useUser();
    const {getToken}=useAuth();
    const navigate = useNavigate();
    const [name,setName] = useState('')
    const [productName,setProductName] = useState('')
    const [productDescription,setProductDescription] = useState('')
    const [aspectRatio,setAspectRatio] = useState('9:16')
    const [productImage,setProductImage] = useState<File | null>(null)
    const [modelImage,setmodelImage] = useState<File | null>(null)
    const [userPrompt,setUserPrompt] = useState('')
    const [isGenerating,setIsGenerating] = useState(false)

    const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>,type:'product' | 'model')=>{
        if(e.target.files && e.target.files[0])
        {
            if(type==='product') setProductImage(e.target.files[0])
                else setmodelImage(e.target.files[0])
        }

    }

    const handleGenerate=async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        if(!user)
        {
            toast.error("Please sign in to generate content");
            return;
        }

        if (!name.trim()) {
            toast.error("Please enter a project name");
            return;
        }

        // FIX: productName is required by backend
        if (!productName.trim()) {
            toast.error("Please enter a product name");
            return;
        }
        
        if (!productImage) {
            toast.error("Please upload a product image");
            return;
        }
        
        if (!modelImage) {
            toast.error("Please upload a model image");
            return;
        }
        if(!aspectRatio)
        {
            toast.error("Please select an aspect ratio");
            return;
        }

        try {
            setIsGenerating(true);
            
            const formData = new FormData();
            formData.append('name', name);
            formData.append('productName', productName);
            formData.append('productDescription', productDescription || '');
            formData.append('aspectRatio', aspectRatio);
            formData.append('userPrompt', userPrompt || '');
            // FIX: backend uses upload.array('images', 2) so both files must use 'images' as field name
            formData.append('images', productImage);
            formData.append('images', modelImage);

            const token = await getToken(); 
            
            // FIX: correct route is /api/project/create, not /api/project/generate
            const response = await api.post('/api/project/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            
            const projectId = response.data.projectId || response.data.id || response.data._id;
            if (!projectId) {
                toast.error("Invalid response from server - no project ID");
                console.error('Expected projectId in response:', response.data);
                return;
            }
            
            toast.success("Generation started! Redirecting...");
            navigate(`/result/${projectId}`);
        } catch (error: any) {
            console.error('Generation error:', error);
            toast.error(error.response?.data?.message || "Failed to generate image. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }
  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form  onSubmit={handleGenerate} className="max-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Content Image"
          description="Upload your model and product images to generate stunning UGC, short-form videos and social media posts."
        />
        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
            {/* left column */}
            <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
                <UploadZone label="Product Image" file={productImage} onClear={()=>setProductImage(null)} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleFileChange(e,'product')}/>
                    <UploadZone label="Model Image" file={modelImage} onClear={()=>setmodelImage(null)} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleFileChange(e,'model')}/>
            </div>
            {/* right column */}
            <div className="w-full">
                <div className="mb-4 text-gray-300">
                    <label htmlFor="name" className="block text-sm mb-4">Project Name</label>
                    <input type="text" id="name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name Your Project" required className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"/>
                </div>
                <div className="mb-4 text-gray-300">
                    {/* FIX: removed "(Optional)" label — productName is required by backend */}
                    <label htmlFor="productName" className="block text-sm mb-4">Product Name</label>
                    <input type="text" id="productName" value={productName} onChange={(e)=>setProductName(e.target.value)} placeholder="Enter name of the product" required className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"/>
            </div>
                <div className="mb-4 text-gray-300">
                    <label htmlFor="productDescription" className="block text-sm mb-4">Product Description <span className="text-xs text-violet-400">(Optional)</span></label>
                    <textarea  id="productDescription" rows={4} value={productDescription} onChange={(e)=>setProductDescription(e.target.value)} placeholder="Enter the description of the product" className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all"/>
            </div>
            <div>
                <div className="mb-4 text-gray-300">
                    <label className="block text-sm mb-4">Aspect Ratio</label>
                    <div className="flex gap-3">
                        <RectangleVerticalIcon onClick={()=>setAspectRatio('9:16')} className={`p-2 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${aspectRatio==='9:16'?'ring-violet-500/50 bg-white/10': ''}`}/>
                            <RectangleHorizontalIcon onClick={()=>setAspectRatio('16:9')} className={`p-2 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${aspectRatio==='16:9'?'ring-violet-500/50 bg-white/10': ''}`}/>
                    </div>
                </div>
                 <div className="mb-4 text-gray-300">
                    <label htmlFor="userPrompt" className="block text-sm mb-4">User Prompt <span className="text-xs text-violet-400">(Optional)</span></label>
                    <textarea  id="userPrompt" rows={4} value={userPrompt} onChange={(e)=>setUserPrompt(e.target.value)} placeholder="Describe how you want the narration to be." className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all"/>
            </div>
            </div>
        </div>
        </div>
        <div className="flex justify-center mt-10">
            <PrimaryButton disabled={isGenerating} className="px-10 py-3 rounded-md disabled:opacity-70 disabled:cursor-not-allowed">
                {isGenerating ? (
                <>
                    <Loader2Icon className=" size-5 animate-spin"/>Generating...
                </>):(
                <>
                    <Wand2Icon  className="size-5"/>Generate Image
                </>)}
            </PrimaryButton>
        </div>
      </form>
    </div>
  )
}

export default Generator;
