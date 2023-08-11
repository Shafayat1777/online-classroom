import { useEffect, useState } from "react";
import { useCoursesContext } from "../hooks/useCourseContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// components
import MyCourses from "../components/myCourses";
import CoursesForm from "../components/CoursesForm";
import CourseDetails from "../components/CourseDetails";

const Dashboard = () => {
  const { courses, dispatch } = useCoursesContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [error, setError] = useState(null);

  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      const respons = await fetch("/api/courses/courses/", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const json = await respons.json();

      if (respons.ok) {
        dispatch({ type: "SET_COURSES", payload: json });
      }
      if (!respons.ok) {
        setError();

        if (json.error === "jwt expired" || json.error === "jwt malformed") {
          // remove user from cookies
          Cookies.remove("user");
          //dispatch logout action
          dispatch({ type: "LOGOUT" });
          navigate("/session");
        }
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user, dispatch, reload]);

  const handleDetailsReload = () => {
    if (reload) {
      setReload(false);
    } else {
      setReload(true);
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
  };
  const handleHideForm = () => {
    setShowForm(false);
  };
  const handleShowDetails = (courseId) => {
    setShowDetails(courseId);
  };
  const closeShowDetails = () => {
    setShowDetails(null);
  };

  return (
    <div>
      <div className="head">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Dashboard</title>
          <link rel="canonical" href="http://mysite.com/example" />
        </Helmet>
      </div>

      <div className="m-8 2xl:flex">
        <div className=" col-span-2 w-full">
          <h1 className="mb-5 text-gray-600 font-semibold text-lg">
            My course
          </h1>
          <div>
            <button
              onClick={handleShowForm}
              className=" rounded-md  bg-orange-400 text-white hover:bg-orange-500  text-md p-1 flex justify-center items-center w-28 text-center"
            >
              Create{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
            </button>
          </div>
          <div>{error && <h1>{error}</h1>}</div>
          <div className="mt-4">
            {courses && (
              <MyCourses
                courses={courses}
                handleShowDetails={handleShowDetails}
                closeShowDetails={closeShowDetails}
                handleDetailsReload={handleDetailsReload}
              />
            )}
          </div>
          <div className="mt-4">
            {showDetails && (
              <CourseDetails courseId={showDetails} reload={reload} />
            )}
          </div>
        </div>
        {showForm && (
          <div className="ml-5">
            <h1 className="mb-5 text-gray-600 font-semibold text-lg">
              <CoursesForm
                handleHideForm={handleHideForm}
                courses={courses}
                handleDetailsReload={handleDetailsReload}
              />
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
