"use client";
import React from "react";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

function page({ params }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const userSession =
    typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "students", params.studentid)).then((doc) => {
        console.log("hello");
        if (doc.exists()) {
          console.log("hello");
          setStudentData(doc.data());
          console.log(doc.data());
        }
      });
    }
  }, [user]);

  return (
    <div>
      <h1>Student Details</h1>
      {studentData && (
      <div>
        <h3>Name : {studentData.name}</h3>
      </div>
      )} 
    </div>
  );
}

export default page;
