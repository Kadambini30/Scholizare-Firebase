'use client'
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../../../firebase/config";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy , updateDoc} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { update } from "firebase/database";

const Page = ({ params }) => {
  const [courseData, setCourseData] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [enrolledStudent, setEnrolledStudent] = useState([]);
  const [user] = useAuthState(auth);

  const scrollRef = useRef();

  // Get the router object
  const router = useRouter();
  // const [showNotification, setShowNotification] = useState(false);
  // const [pendingRequests, setPendingRequests] = useState([]);

  // const courseId = params.courseid;

  // handleAccept = (studentId) => async () => {
  //   const docRef = doc(db, "students", studentId);
  //   const docSnap = await getDoc(docRef);
  //   if (docSnap.exists()) {
  //     const studentData = docSnap.data();
  //     const studentCourses = studentData.courses;
  //     studentCourses.push(courseId);
  //     await updateDoc(docRef, {
  //       courses: studentCourses,
  //     });
  //   } else {
  //     console.log("No such document!");
  //   }
  //   const courseDocRef = doc(db, "courses", courseId);
    
  // }
  // Fetch course data and enrolled students on component mount

    // Fetch course data and enrolled students on component mount
    useEffect(() => {
      const fetchCourseData = async () => {
        const courseRef = doc(db, "courses", params.courseid);
        const courseSnap = await getDoc(courseRef);
  
        if (courseSnap.exists()) {
          setCourseData(courseSnap.data());
          const enrollstudentname = [];
          if(courseSnap.data().students){
              for(var i = 0;i<courseSnap.data().students.length;i++){
                  const studentRef = doc(db, "students", courseSnap.data().students[i]);
                  const studentSnap = await getDoc(studentRef);
                  if (user && user.uid) {
                    // Access the 'uid' property safely
                    console.log("User UID:", user.uid);
                  } else {
                    console.error("User is null or undefined");
                  }
                  if(studentSnap.exists()){
                      enrollstudentname.push(studentSnap.data().name);
                  }
              }
          }
          setEnrolledStudent(enrollstudentname);
          setMessages(courseSnap.data().messages);
        }
      };
  
      fetchCourseData();
    }, [params.courseid, newMessage, user]);

  useEffect(() => {
    const fetchCourseData = async () => {
      const courseRef = doc(db, "courses", params.courseid);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        setCourseData(courseSnap.data());
        // setEnrolledStudent(courseSnap.data().students);
        setMessages(courseSnap.data().messages);
      }
    };

    fetchCourseData();
  }, [params.courseid, newMessage]);

  const picChange = (e) => {
    console.log(e);
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
      console.log("profile pic base 64: ", reader.result);
      setNewMessage(reader.result);
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };

    // Update the current page when the button is clicked
    const handleSectionChange = (section) => {
      setCurrentPage(section);
      // Save the current page to local storage
      localStorage.setItem("currentPage", section);
    };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return; // Do not send empty messages
    }
  
    const currentDate = new Date();
  
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
  
    const formattedDate = currentDate.toLocaleString('en-US', options);
  
    try {
      // Get the current messages document
      const messageRef = doc(db, 'courses', params.courseid);
      const messageData = await getDoc(messageRef);
      
      if (messageData.exists()) {
        // If the document exists, update the messages field
        const messages = messageData.data().messages || [];
        messages.push({ message: newMessage.trim(), sender: "teacher", timestamp: formattedDate });
  
        // Update the document with the new messages array
        await updateDoc(messageRef, { messages });
  
        // Reset the new message input
        setNewMessage('');
      } else {
        console.error('Messages document not found.');
      }
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };
  


  // Scroll to the bottom of the chat window on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentPage]);


  return (
    <div className="p-4 h-full">
    <div className=" bg-white h-full">
  {/* Course Title */}
  <h1 className="text-4xl font-bold mb-8 text-black font-merriweather text-center">
    Check details of {courseData && courseData.courseName} class:
  </h1>

  {/* Section Navigation Buttons */}
  <div className="bg-secondary p-10 rounded-lg h-96
  ">
  <div className="flex space-x-4 mb-8">
    <button
      className="px-6 py-3 bg-primary text-white rounded focus:outline-none"
      onClick={() => handleSectionChange("home")}
    >
      Participants
    </button>
    <button
      className="px-6 py-3 bg-primary text-white rounded focus:outline-none"
      onClick={() => handleSectionChange("file")}
    >
      File
    </button>
    <button
      className="px-6 py-3 bg-primary text-white rounded focus:outline-none"
      onClick={() => handleSectionChange("message")}
    >
      Message
    </button>
  </div>

  {/* Participants Section */}
  {currentPage === "home" && courseData && (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Participants</h2>
      <div className="bg-gray-200 p-3 mb-4">
        <p className="text-black">{courseData.institutionName}</p>
      </div>
      {enrolledStudent &&
        enrolledStudent.map((student, index) => (
          <div className="bg-gray-200 p-3 mb-4" key={index}>
            <p className="text-lg">{student}</p>
          </div>
        ))}
    </div>
  )}

  {/* File Section */}
  {currentPage === "file" && (
    <div className="mb-8">
      <h2 className="text-2xl font-bold">File Section</h2>
      {/* Add your file section content here */}
    </div>
  )}

  {/* Message Section */}
  {currentPage === "message" && (
    <div className="flex flex-col items-center bg-red-100 p-6 rounded-lg w-96">
      <h2 className="text-2xl font-bold mb-4">Message Section</h2>
      <div className="overflow-y-scroll h-48 mb-4">
        {messages.length > 0 &&
          messages.map((message, index) => (
            <div className="bg-gray-200 p-3 mb-4 rounded" key={index}>
              {message.message.includes("data:image") &&
              message.message.length > 2000 ? (
                <img
                  className="rounded-md w-32 h-auto"
                  src={message.message}
                  alt="message"
                />
              ) : (
                <p className="text-lg">{message.message}</p>
              )}
              <p className="text-xs">Sender: {message.sender}</p>
              <p className="text-xs">Time: {message.timestamp}</p>
            </div>
          ))}
      </div>

      {/* Send Message Area */}
      <div className="mb-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter your message"
          className="p-2 border border-gray-300 rounded w-full"
        />
        {newMessage.length > 0 &&
          newMessage.match(/\.(jpeg|jpg|gif|png)$/) && (
            <img
              className="w-40 h-40 mt-2 rounded-full"
              src={newMessage}
              alt="profile pic"
            />
          )}
        <input
          accept="image/*"
          type="file"
          name="image"
          onChange={picChange}
          autoComplete="image"
          className="my-2"
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  )}
</div>
  {/* Generate Google Meet Link Button */}
  <button
    onClick={() => window.open("https://meet.google.com/", "_blank")}
    className="px-3 py-3 bg-primary text-white rounded mt-4 focus:outline-none"
  >
    Generate Google Meet link
  </button>
</div>
</div>
  );
};

export default Page;