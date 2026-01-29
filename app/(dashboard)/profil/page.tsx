// "use client"
import React from 'react'
import { useSession } from "@/context/SessionContext";
import Loader from '@/components/loader';
import { Profil } from '@/components/main/profil';
import { getUser } from '@/actions/getUser';

const page = 
async () => {
// () => {
  // const { user, isAuthenticated } = useSession();
  const user = await getUser();
  // console.log('=========================');
  // console.log(user);
  // console.log('=========================');

  

  return (
    <div>  
      {/* {
        JSON.stringify(user)
      }
      <Loader fullScreen={true} /> */}
      <Profil user={user.user.user}/>
    </div>
  )
}

export default page