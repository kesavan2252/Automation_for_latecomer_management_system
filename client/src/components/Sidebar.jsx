import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import icon from "/img/image.png";
import {
  DashboardIcon,
  ReportsIcon,
  GeneralReportIcon,
  ImportDataIcon,
  EditRecordsIcon,
  DeleteRecordsIcon,
  LogoutIcon
} from "./icons"; // Assuming you have an icons.js file with these SVG components

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <DashboardIcon className="w-5 h-5" />,
      path: "/dashboard",
      type: "link"
    },
    {
      name: "Analytics",
      icon: <ReportsIcon className="w-5 h-5" />,
      type: "dropdown",
      subItems: [
        { name: "Student Analytics", path: "/reports/student" },
        { name: "Department Analytics", path: "/reports/department" }
      ]
    },
    {
      name: "General Report",
      icon: <GeneralReportIcon className="w-5 h-5" />,
      path: "/view-data",
      type: "link"
    },
    {
      name: "Record Operations",  // Changed from "Data Tools"
      icon: <ImportDataIcon className="w-5 h-5" />,
      type: "dropdown",
      subItems: [
        { 
          name: "Add Records",  // Changed from "Import Data"
          submenu: [
            { name: "Single Entry", path: "/data-tools/import/individual" },
            { name: "Bulk Import", path: "/data-tools/import/batch" }
          ]
        },
        { name: "Edit Records", path: "/data-tools/edit" },
        { 
          name: "Remove Records",  // Changed from "Delete Records"
          submenu: [
            { name: "Single Removal", path: "/data-tools/delete/individual" },
            { name: "Bulk Removal", path: "/data-tools/delete/batch" }
          ]
        }
      ]
    }
  ];

  // Update the main container and styling
  return (
    <div className="w-[250px] min-h-screen bg-gradient-to-b from-indigo-900 via-blue-800 to-blue-900 p-5 flex flex-col">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl inline-block shadow-lg">
          <img src={icon} alt="College Logo" className="h-14 w-14 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-white mt-3">Management System</h2>
      </div>
  
      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.type === "link" ? (
              <Link
                to={item.path}
                className="flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm"
              >
                <span className="mr-3 flex items-center text-blue-200">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm"
                >
                  <div className="flex items-center">
                    <span className="mr-3 flex items-center text-blue-200">{item.icon}</span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <span className="text-xs text-blue-200">
                    {activeMenu === item.name ? "-" : "+"}
                  </span>
                </button>
                {activeMenu === item.name && (
                  <div className="ml-10 mt-1 space-y-1 border-l border-blue-400/30 pl-2">
                    {item.subItems.map((subItem, subIndex) => (
                      <div key={subIndex} className="relative">
                        {subItem.submenu ? (
                          <div
                            onMouseEnter={() => setHoveredSubmenu(subItem.name)}
                            onMouseLeave={() => setHoveredSubmenu(null)}
                            className="group"
                          >
                            <button className="w-full text-left py-2 px-3 text-blue-100 hover:text-white flex items-center justify-between rounded transition-colors text-sm group">
                              <span>{subItem.name}</span>
                              <span className="text-xs text-blue-200 transform transition-transform group-hover:translate-x-1">
                                {hoveredSubmenu === subItem.name ? '>' : '+'}
                              </span>
                            </button>
                            {hoveredSubmenu === subItem.name && (
                              <div className="absolute left-full top-0 ml-1 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-lg shadow-xl z-20 w-48 py-1 border border-blue-400/30">
                                {subItem.submenu.map((nestedItem, nestedIndex) => (
                                  <Link
                                    key={nestedIndex}
                                    to={nestedItem.path}
                                    className="block px-4 py-2 text-sm text-blue-100 hover:bg-white/10 hover:text-white"
                                  >
                                    {nestedItem.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            to={subItem.path}
                            className="block py-2 px-3 text-blue-100 hover:text-white rounded transition-colors text-sm"
                          >
                            {subItem.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
  
      {/* Admin Profile */}
      <div className="mt-auto pt-4 border-t border-blue-400/30">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
            <span>AD</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Admin User</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 mt-3 text-white hover:bg-red-500/10 rounded-lg transition-all group"
        >
          <span className="mr-3 flex items-center text-red-300 group-hover:text-red-600">
            <LogoutIcon className="w-5 h-5" />
          </span>
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;