import React from "react";
import "./App.css";

function App() {
  const [data, setData] = React.useState([]);

  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  const [selectedRole, setSelectedRole] = React.useState("");

  React.useEffect(() => {
    fetchData();
  }, [page]);

  React.useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const body = JSON.stringify({
      limit: 50,
      offset: 0,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body,
    };

    fetch(
      "https://api.weekday.technology/adhoc/getSampleJdJSON",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => setData(result))
      .catch((error) => console.error(error));
  }, []);

  // console.log(data);

  const [selectedExperience, setSelectedExperience] = React.useState();
  const [selectedEmployees, setSelectedEmployees] = React.useState("");
  const [selectedRemote, setSelectedRemote] = React.useState("");
  const [selectedMinBasePay, setSelectedMinBasePay] = React.useState("");
  const [searchCompanyName, setSearchCompanyName] = React.useState("");
  const [filteredJobs, setFilteredJobs] = React.useState([]); 

  const handleCompanyInputChange = (e) => {
    setSearchCompanyName(e.target.value);
  };

  const fetchData = () => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const body = JSON.stringify({
      limit: 50,
      offset: (page - 1) * 50,
    });
  
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body,
    };
  
    fetch("https://api.weekday.technology/adhoc/getSampleJdJSON", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.jdList.length === 0) {
          setHasMore(false);
        } else {
          // Use a callback function to ensure correct previous state
          setData((prevData) => {
            return Array.isArray(prevData) 
              ? [...(prevData || []), ...result.jdList] 
              : [...result.jdList];
          });
        }
        setLoading(false);
      })
      .catch((error) => console.error(error));
  };
  

  const handleScroll = () => {
    console.log("Scroll event triggered");
    console.log("loading:", loading);
    console.log("hasMore:", hasMore);
    console.log(
      "Window height:",
      window.innerHeight,
      "Scroll top:",
      document.documentElement.scrollTop,
      "Document height:",
      document.documentElement.offsetHeight
    );

    // Calculate whether the user has scrolled to the bottom of the page
    const isBottomOfPage =
      document.documentElement.offsetHeight -
        window.innerHeight -
        document.documentElement.scrollTop <
      50;

    if (!loading && hasMore && isBottomOfPage) {
      // If not currently loading, there is more data, and the user has scrolled to the bottom, increment the page number
      setPage((prevPage) => prevPage + 1);
    }
  };

  React.useEffect(() => {
    const filteredData = data?.jdList?.filter((item) => {
      const selectedExperienceNumber = selectedExperience
        ? parseInt(selectedExperience)
        : undefined;
      const selectedEmployeesRange = selectedEmployees.split("-").map(Number);

      // Role filter
      const roleFilter =
        !selectedRole ||
        item.jobRole.toLowerCase() === selectedRole.toLowerCase();

      // Experience filter
      const experienceFilter =
        !selectedExperience ||
        (selectedExperienceNumber !== undefined &&
          (item.minExp <= selectedExperienceNumber ||
            item.maxExp >= selectedExperienceNumber));

      // Number of employees filter
      const employeesFilter =
        !selectedEmployees ||
        selectedEmployees === "1-10" ||
        selectedEmployees === "11-20" ||
        selectedEmployees === "21-50" ||
        selectedEmployees === "51-100" ||
        selectedEmployees === "101-200" ||
        selectedEmployees === "201-500" ||
        selectedEmployees === "500+";

      // Remote filter
      const remoteFilter =
        !selectedRemote ||
        (selectedRemote.toLowerCase() === "hybrid" &&
          item.location.toLowerCase() !== "hybrid") ||
        (selectedRemote.toLowerCase() === "in-office" &&
          item.location.toLowerCase() !== "in-office" &&
          item.location.toLowerCase() !== "remote") ||
        (selectedRemote.toLowerCase() !== "in-office" &&
          item.location.toLowerCase() === selectedRemote.toLowerCase());

      // Minimum Base Pay Salary filter
      const minBasePayFilter =
        !selectedMinBasePay ||
        parseInt(selectedMinBasePay) === item.minJdSalary;

      // Company Name search filter
      const companyNameFilter =
        !searchCompanyName ||
        item.companyName
          .toLowerCase()
          .includes(searchCompanyName.toLowerCase());

      return (
        roleFilter &&
        experienceFilter &&
        employeesFilter &&
        remoteFilter &&
        minBasePayFilter &&
        companyNameFilter
      );
    });

    console.log("Filtered Jobs:", filteredJobs);
    setFilteredJobs(filteredData);
    // console.log("Filtered Jobs:", filteredJobs);
  }, [
    data,
    selectedRole,
    selectedExperience,
    selectedEmployees,
    selectedRemote,
    selectedMinBasePay,
    searchCompanyName,
  ]);

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, hasMore]);

  console.log("Filtered Jobs:", filteredJobs);
  return (
    <div className="App">
    <RoleDropdown
      setSelectedRole={setSelectedRole}
      setSelectedExperience={setSelectedExperience}
      setSelectedEmployees={setSelectedEmployees}
      setSelectedRemote={setSelectedRemote}
      setSelectedMinBasePay={setSelectedMinBasePay}
      SearchCompanyName={searchCompanyName}
      handleCompanyInputChange={handleCompanyInputChange}
    />
    {filteredJobs !== undefined &&
      filteredJobs.map((item) => {
        return <Card key={item.jdUid} data={item} />;
      })}
    {loading && <p>Loading...</p>}
  </div>
  );
}

export default App;

const Card = ({ data }) => {
  const {
    companyName,
    jobRole,
    maxExp,
    minExp,
    maxJdSalary,
    minJdSalary,
    salaryCurrencyCode,
    location,
    logoUrl,
    jobDetailsFromCompany,
    jdLink,
    skills,
  } = data;

  return (
    <div className="card-container">
      <div className="card-post">
        <span>⏳ Posted 4 days ago</span>
      </div>
      <div className="card-info">
        <div className="cmp-logo">
          <img src={logoUrl} width={25} height={40} alt="company-logo" />
        </div>
        <div className="cmp-des">
          <div className="comp-name">{companyName}</div>
          <div className="comp-position">{jobRole}</div>
          <div className="comp-loc">
            {location} {minExp && maxExp && `| Exp: ${minExp}-${maxExp} years`}
          </div>
        </div>
      </div>
      <div className="card-salary">
        Estimated Salary: {salaryCurrencyCode}
        {minJdSalary} - {maxJdSalary} LPA ✅
      </div>

      <div className="cmp-about">About Company:</div>

      <div className="cmp-about-us">About us:</div>

      <div className="cmp-desc">{jobDetailsFromCompany}</div>

      <div className="cmp-link">
        <a href={jdLink}>View job</a>
      </div>

      {skills && (
        <div>
          <div className="cmp-skills">Skills</div>
          <div className="skill-container">
            {skills.map((skill, index) => (
              <div key={index} className="skill-item">
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="min-exp">Minimum Experience</div>
      <div className="cmp-exp">{minExp} years</div>

      <div className="btn">
        <button className="apply-btn">⚡ Easy Apply</button>
      </div>
    </div>
  );
};

const RoleDropdown = ({
  setSelectedRole,
  setSelectedExperience,
  setSelectedEmployees,
  setSelectedRemote,
  setSelectedMinBasePay,
  SearchCompanyName,
  handleCompanyInputChange,
}) => {
  const companyRoles = [
    // Company roles data
  ];

  const numberOfEmployees = [
    "1-10",
    "11-20",
    "21-50",
    "51-100",
    "101-200",
    "201-500",
    "500+",
  ];

  const experience = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const remote = ["Remote", "Hybrid", "In-Office"];

  const minBasePay = ["0", "10", "20", "30", "40", "50", "60", "70"];

  return (
    <div className="dropdown-wrapper">
      {/* Roles dropdown */}
      <div className="dropdown-container">
        <label htmlFor="role-dropdown">Roles</label>
        <select
          id="role-dropdown"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {companyRoles.map((section) => (
            <optgroup key={section.section} label={section.section}>
              {section.roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Number of employees dropdown */}
      <div className="dropdown-container">
        <label htmlFor="employees-dropdown">Number of Employees</label>
        <select
          id="employees-dropdown"
          onChange={(e) => setSelectedEmployees(e.target.value)}
        >
          {numberOfEmployees.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Experience dropdown */}
      <div className="dropdown-container">
        <label htmlFor="experience-dropdown">Experience</label>
        <select
          id="experience-dropdown"
          onChange={(e) => setSelectedExperience(e.target.value)}
        >
          {experience.map((years) => (
            <option key={years} value={years}>{`${years} year${
              years !== 1 ? "s" : ""
            }`}</option>
          ))}
        </select>
      </div>

      {/* Remote dropdown */}
      <div className="dropdown-container">
        <label htmlFor="remote-dropdown">Remote</label>
        <select
          id="remote-dropdown"
          onChange={(e) => setSelectedRemote(e.target.value)}
        >
          {remote.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Base Pay Salary dropdown */}
      <div className="dropdown-container">
        <label htmlFor="min-base-pay-dropdown">Minimum Base Pay Salary</label>
        <select
          id="min-base-pay-dropdown"
          onChange={(e) => setSelectedMinBasePay(e.target.value)}
        >
          {minBasePay.map((option) => (
            <option key={option} value={option}>
              {option}L
            </option>
          ))}
        </select>
      </div>

      {/* Company Search */}
      <div className="dropdown-container">
        <label htmlFor="company-name-input">Search Company Name</label>
        <input
          type="text"
          id="company-name-input"
          value={SearchCompanyName}
          onChange={handleCompanyInputChange}
        />
      </div>
    </div>
  );
};
