"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { LoginSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,  
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { login } from "@/actions/login";
import { Checkbox } from "@/components/ui/checkbox"
import appConfig from "@/settings";
import Image from "next/image";



export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Email already in use with different provider!"
    : "";
  
  const router = useRouter(); // Pour rediriger l'utilisateur

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Pour basculer le mot de passe
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login({ ...values })
        .then((data) => {
          if (data?.error) {
            // form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            router.push(callbackUrl); // Redirection après succès
          }

          // if (data?.twoFactor) {
          //   setShowTwoFactor(true);
          // }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    // <CardWrapper
    //   headerLabel="Welcome back"
    //   backButtonLabel="Don't have an account?"
    //   backButtonHref="/auth/signup"
    //   showSocial
    // >
    //   <Form {...form}>
    //     <form 
    //       onSubmit={form.handleSubmit(onSubmit)}
    //       className="space-y-6"
    //     >
    //       <div className="space-y-4">
    //         {showTwoFactor && (
    //           <FormField
    //             control={form.control}
    //             name="code"
    //             render={({ field }) => (
    //               <FormItem>
    //                 <FormLabel>Two Factor Code</FormLabel>
    //                 <FormControl>
    //                   <Input
    //                     {...field}
    //                     disabled={isPending}
    //                     placeholder="123456"
    //                   />
    //                 </FormControl>
    //                 <FormMessage />
    //               </FormItem>
    //             )}
    //           />
    //         )}
    //         {!showTwoFactor && (
    //           <>
    //             <FormField
    //               control={form.control}
    //               name="email"
    //               render={({ field }) => (
    //                 <FormItem>
    //                   <FormLabel>Email</FormLabel>
    //                   <FormControl>
    //                     <Input
    //                       {...field}
    //                       disabled={isPending}
    //                       placeholder="john.doe@example.com"
    //                       type="email"
    //                     />
    //                   </FormControl>
    //                   <FormMessage />
    //                 </FormItem>
    //               )}
    //             />
    //             <FormField
    //               control={form.control}
    //               name="password"
    //               render={({ field }) => (
    //                 <FormItem>
    //                   <FormLabel>Password</FormLabel>
    //                   <div className="relative">
    //                     <FormControl>
    //                       <Input
    //                         {...field}
    //                         disabled={isPending}
    //                         placeholder="******"
    //                         type={showPassword ? "text" : "password"}
    //                       />
    //                     </FormControl>
    //                     <div
    //                       className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
    //                       onClick={() => setShowPassword((prev) => !prev)}
    //                     >
    //                       {showPassword ? (
    //                         <Icon icon="mdi:eye-off" width={24} height={24} />
    //                       ) : (
    //                         <Icon icon="mdi:eye" width={24} height={24} />
    //                       )}
    //                     </div>
    //                   </div>
                      
    //                   <div className="flex items-center justify-around my-2 pt-2">
    //                     <Button
    //                       size="sm"
    //                       variant="link"
    //                       asChild
    //                       className="px-0 font-normal hover:text-gray-400"
    //                     >
    //                       <Link href="/auth/forgot-password" className="text-[14px]">
    //                         Forgot password?
    //                       </Link>
    //                     </Button>
    //                     {/* Checkbox Remember Me */}
    //                     <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-400">
    //                        <FormField
    //                           control={form.control}
    //                           name="rememberMe"
    //                           render={({ field }) => (
    //                             <FormItem className="flex flex-row items-start space-x-3 space-y-0 cursor-pointer">
    //                               <FormControl>
    //                                 <Checkbox
    //                                   checked={field.value}
    //                                   onCheckedChange={field.onChange}
    //                                 />
    //                               </FormControl>
    //                               <div className="space-y-1 leading-none cursor-pointer">
    //                                 <FormLabel>
    //                                     Remember me
    //                                 </FormLabel>
    //                               </div>
    //                             </FormItem>
    //                           )}
    //                         />  
    //                     </div>
    //                   </div>
    //                   <FormMessage />
    //                 </FormItem>
    //               )}
    //             />
    //           </>
    //         )}
    //       </div>
    //       <FormError message={error || urlError} />
    //       <FormSuccess message={success} />
    //       <Button
    //         disabled={isPending}
    //         type="submit"
    //         className="w-full"
    //       >
    //         {showTwoFactor ? "Confirm" : "Login"}
    //       </Button>
    //     </form>
    //   </Form>
    // </CardWrapper>
    <div className="w-full max-w-4xl mx-auto">
    {/* Carte rectangulaire avec 2 côtés */}
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* Côté gauche - Couleur Mjs avec logo */}
          <div 
            className="p-8 flex flex-col justify-center items-center text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${appConfig.primaryColor} 0%, ${appConfig.primaryDarkColor} 100%)`
            }}
          >
          {/* Formes décoratives */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          {/* Contenu */}
          <div className="relative z-10 text-center px-6">
            {/* Logo Mjs */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                <Image
                  src="/armoirie.png"
                  alt="Logo Mjs"
                  width={96}
                  height={96}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            {/* Titre principal */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              République du Niger
            </h1>
            
            {/* Devise */}
            <p className="text-sm mb-4 text-white/95">
              Fraternité – Travail – Progrès
            </p>
            
            {/* Nom du ministère */}
            <h2 className="text-lg md:text-xl font-semibold mb-8 text-white/90">
              Ministère de la Jeunesse et des Sports
            </h2>
            
            {/* Message de bienvenue */}
            <div className="mt-8 space-y-4 text-left">
              <p className="text-white/95 text-center text-sm md:text-base leading-relaxed">
                Bienvenue sur la plateforme numérique du Ministère.Veuillez vous authentifier pour accéder à votre espace personnel.
              </p>
              {/* <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Ce système a été conçu pour faciliter la gestion des données,
                améliorer la communication et moderniser les services administratifs.
              </p> */}
              {/* <p className="text-white/95 text-sm md:text-base leading-relaxed font-medium mt-6">
                Veuillez vous authentifier pour accéder à votre espace personnel.
              </p> */}
            </div>
            
            {/* Informations système */}
            <div className="mt-10 space-y-3">
              {/* <p className="text-white/90 text-sm md:text-base font-semibold">
                Système de Gestion du Ministère
              </p> */}
              
              {/* Badge sécurisé */}
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white/95 font-medium text-[9px] md:text-base">Système sécurisé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Côté droit - Formulaire */}
        <div className="p-8 flex flex-col justify-center">
          {/* Titre du formulaire */}
          <div className="mb-6 text-center ">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Connectez-vous à votre compte
            </h2>
            <p className="text-gray-600 text-sm">
              Accédez à votre espace
            </p>
          </div>


          {/* Formulaire */}
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
             <div className="space-y-4">
               {showTwoFactor && (
                 <FormField
                   control={form.control}
                   name="code"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Two Factor Code</FormLabel>
                       <FormControl>
                         <Input
                           {...field}
                           disabled={isPending}
                           placeholder="123456"
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               )}
               {!showTwoFactor && (
                 <>
                   <FormField
                     control={form.control}
                     name="email"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Email</FormLabel>
                         <FormControl>
                           <Input
                             {...field}
                             disabled={isPending}
                             placeholder="john.doe@example.com"
                             type="email"
                           />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="password"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Password</FormLabel>
                         <div className="relative">
                           <FormControl>
                             <Input
                               {...field}
                               disabled={isPending}
                               placeholder="******"
                               type={showPassword ? "text" : "password"}
                             />
                           </FormControl>
                           <div
                             className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                             onClick={() => setShowPassword((prev) => !prev)}
                           >
                             {showPassword ? (
                               <Icon icon="mdi:eye-off" width={24} height={24} />
                             ) : (
                               <Icon icon="mdi:eye" width={24} height={24} />
                             )}
                           </div>
                         </div>
                           
                         <div className="flex items-center justify-around my-2 pt-2">
                           <Button
                             size="sm"
                             variant="link"
                             asChild
                             className="px-0 font-normal hover:text-gray-400"
                           >
                             <Link href="/auth/forgot-password" className="text-[14px]">
                               Forgot password?
                             </Link>
                           </Button>
                           {/* Checkbox Remember Me */}
                           <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-400">
                              <FormField
                                 control={form.control}
                                 name="rememberMe"
                                 render={({ field }) => (
                                   <FormItem className="flex flex-row items-start space-x-3 space-y-0 cursor-pointer">
                                     <FormControl>
                                       <Checkbox
                                         checked={field.value}
                                         onCheckedChange={field.onChange}
                                       />
                                     </FormControl>
                                     <div className="space-y-1 leading-none cursor-pointer">
                                       <FormLabel>
                                           Remember me
                                       </FormLabel>
                                     </div>
                                   </FormItem>
                                 )}
                               />  
                           </div>
                         </div>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </>
               )}
             </div>
             <FormError message={error || urlError} />
             <FormSuccess message={success} />
             <Button
               disabled={isPending}
               type="submit"
               className="w-full bg-primaryColor text-white hover:bg-primaryColor/90"
             >
               {showTwoFactor ? "Confirm" : "Connecter"}
             </Button>
             
             {/* Message pour créer un compte */}
             <div className="text-center mt-4">
               <p className="text-sm text-gray-600">
                 Vous n'avez pas de compte ?{" "}
                 <Link 
                   href="/auth/signup" 
                   className="text-primaryColor hover:text-primaryDarkColor font-medium transition-colors underline"
                 >
                   Créer un compte
                 </Link>
               </p>
             </div>
           </form>
         </Form>
        </div>
      </div>
    </div>
  </div>
  );
};
