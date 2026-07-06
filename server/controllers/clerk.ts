import { Request, Response } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks'
import prisma from '../configs/prisma.js';
import * as Sentry from "@sentry/node";


const clerkwebhook = async (req: Request, res: Response) => {
    try{
        const evt:any  = await verifyWebhook(req)
        const {data,type}=evt;
        switch(type){
            case 'user.created':{
                await prisma.user.create({
                    data:{
                        id:data.id,
                        email:data?.email_addresses[0]?.email_address || null,
                        name:(data?.first_name && data?.last_name) ? data.first_name+" "+data.last_name : "Unknown User",
                        image:data?.profile_image_url || null,
                    }
                })
                break;
            }
            case 'user.updated':{
                await prisma.user.update({
                    where:{
                        id:data.id
                    },
                    data:{
                        
                        email:data?.email_addresses[0]?.email_address || null,
                        name:(data?.first_name && data?.last_name) ? data.first_name+" "+data.last_name : "Unknown User",
                        image:data?.profile_image_url || null,
                    }
                })
                break;
            }
            case 'user.deleted':{
                await prisma.user.delete({
                    where:{
                        id:data.id
                    }
                })
                break;
            }
            case "paymentattempt.updated":{
                if ((data.charge_type === "recurring" || data.charge_type === "ocheckout") && data.status === "paid") {
                    const credits = { pro: 80, premium: 240 };
                    const clerkUserId = data?.payer?.user_id;
                    // determine plan id either from direct plan or first subscription item
                    const planId = data?.plan?.id || data?.subscription_items?.[0]?.plan_id;

                    if (clerkUserId && planId && credits.hasOwnProperty(planId)) {
                        const creditAmount = credits[planId as keyof typeof credits];
                        await prisma.user.update({
                            where: { id: clerkUserId },
                            data: { credits: { increment: creditAmount } },
                        });
                    }
                }
                break;
            }
            default:
                break;
        }
        res.json({message:"Webhook received:"+type})
    } catch(error: any) {
        Sentry.captureException(error);
        return res.status(500).json({message:error.message})
    }
}
export default clerkwebhook;