// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Blueprint from "../images/Blueprint.png";
// import Bookmark from '../images/Bookmark.png';
// import Classroom from "../images/Classroom.png";
// import Graph from "../images/Graph.png";
// import Home from "../images/Home.png";

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const [openSubMenu, setOpenSubMenu] = useState(null);
//   const [activeLabel, setActiveLabel] = useState("Dashboard");
//   const navigate = useNavigate();

//   const toggleSubMenu = (menu) => {
//     setOpenSubMenu(openSubMenu === menu ? null : menu);
//   };

//   const handleItemClick = (item) => {
//     if (item.path) {
//       console.log("activelabel", activeLabel);
//       setActiveLabel(item.label);
//       console.log("item", item.label);

//       navigate(item.path);
//       console.log("activeLabel", activeLabel);
//     }
//   };

//   // useEffect(() => {
//   //   setActiveLabel();
//   // }, []);

//   return (
//     <div
//       className={`d-flex flex-column bg-light shadow ${isOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}
//       style={{
//         height: "100vh",
//         width: isOpen ? "150px" : "60px",
//         transition: "width 0.3s ease",
//         position: "fixed",
//         top: 0,
//         left: 0,
//         overflow: "hidden",
//       }}
//     >
//       <header
//         className="d-flex justify-content-center align-items-center p-3 m-3"
//         onClick={toggleSidebar}
//         style={{
//           cursor: "pointer",
//           borderBottom: "2px solid #00000042",
//         }}
//       >
//         <span
//           className="mb-0 fs-5 fw-bolder"
//           style={{
//             fontFamily: "Bebas Neue",
//           }}
//         >
//           LMS
//         </span>
//       </header>

//       <div className="mt-3 flex-grow-1" style={{ fontSize: "14px" }}>
//         {[ 
//           { icon: Home, Key: "Dashboard", label: "Dashboard", path: "/dashboard" },
//           { icon: Bookmark, Key: "syllabus", label: "Create Syllabus", path: "/create-syllabus/" },
//           { icon: Classroom, Key: "track", label: "Create Track" },
//           { icon: Blueprint, Key: "plan", label: "Create Course-Plan" },
//           { icon: Graph, Key: "Report", label: "Report" },
//         ].map((item, index) => (
//           <div key={index}>
//             <div
//               className={`d-flex align-items-center p-2 px-3 mb-1 hover-bg-primary `}
//               style={{
//                 cursor: "pointer",
//                 borderLeft: activeLabel === item.label ? '3px solid rgba(8, 8, 8, 0.62)' : 'none',
//               }}
//               onClick={() => handleItemClick(item)}
//               title={item.label}
//             >
//               <img
//                 src={item.icon}
//                 alt={item.label}
//                 className="me-3"
//                 style={{
//                   width: isOpen ? "20px" : "30px",
//                 }}
//               />
//               <span className={isOpen ? "d-block" : "d-none"}>{item.label}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
// export default Sidebar;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Blueprint from "../images/Blueprint.png";
import Bookmark from '../images/Bookmark.png';
import Classroom from "../images/Classroom.png";
import Graph from "../images/Graph.png";
import Home from "../images/Home.png";
import SubjectPlan from "../images/SubjectPlan.png";
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeLabel, setActiveLabel] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 
  const sidebarItems = [
    { icon: Home, key: "Dashboard", label: "Dashboard", path: "/dashboard" },
    // { icon: Bookmark, key: "syllabus", label: "Create Syllabus", path: "/create-syllabus/" },
    // { icon: Classroom, key: "track", label: "Create Track" }, 
    // { icon: Blueprint, key: "plan", label: "Assign Batch", path: "/assign-batch" },
    // { icon: Graph, key: "Report", label: "Report" },
    // {icon:SubjectPlan, key: "SubjectPlan", label:"Create Subject Plan",path:"/subject-plan"}
  ];

  const handleItemClick = (item) => {
    if (item.path) {
      setActiveLabel(item.label);
      navigate(item.path);
    } else {
      console.warn(`No path provided for ${item.label}`);
    }
  };

  useEffect(() => {
    const activeItem = sidebarItems.find(item => item.path === location.pathname);
    if (activeItem) {
      setActiveLabel(activeItem.label);
    }
  }, [location.pathname]);

  return (
    <div
      className={`d-flex flex-column bg-light shadow ${isOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}
      style={{
        height: "100vh",
        width: isOpen ? "150px" : "60px",
        transition: "width 0.3s ease",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      <header
        className="d-flex justify-content-center align-items-center p-3 m-3"
        onClick={toggleSidebar}
        style={{
          cursor: "pointer",
          borderBottom: "2px solid #00000042",
        }}
      >
        <span
          className="mb-0 fs-5 fw-bolder"
          style={{
            fontFamily: "Bebas Neue",
          }}
        >
          LMS
        </span>
      </header>
      <div className="mt-3 flex-grow-1" style={{ fontSize: "14px" }}>
        {sidebarItems.map((item, index) => (
          <div key={index}>
            <div
              className={`d-flex align-items-center p-2 px-3 mb-1 hover-bg-primary`}
              style={{
                cursor: "pointer",
                borderLeft: activeLabel === item.label ? '3px solid rgba(8, 8, 8, 0.62)' : 'none',
              }}
              onClick={() => handleItemClick(item)}
              title={item.label}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="me-3"
                style={{
                  width: isOpen ? "20px" : "30px",
                }}
              />
              <span className={isOpen ? "d-block" : "d-none"}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Sidebar;