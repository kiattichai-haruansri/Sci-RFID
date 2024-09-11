import { useEffect, useState } from "react";
import { getStudents } from "./api/get_students";
import { getAllLocations } from "./api/get_locations";
import { getAllAttendance } from "./api/get_attendance";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const Switch = ({ checked, onChange }) => (
  <div
    className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer ${
      checked ? "bg-blue-500" : "bg-gray-300"
    }`}
    onClick={() => onChange(!checked)}
  >
    <div
      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
        checked ? "translate-x-7" : ""
      }`}
    />
  </div>
);

export default function Home() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showUniqueRecords, setShowUniqueRecords] = useState(true);
  const [searchQuery, setSearchQuery] = useState({
    name: "",
    studentId: "",
    rfid: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
  });

  useEffect(() => {
    // Only run this code on the client side
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("showUniqueRecords");
      if (savedMode !== null) {
        setShowUniqueRecords(JSON.parse(savedMode));
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showUniqueRecords", JSON.stringify(showUniqueRecords));
    }
  }, [showUniqueRecords]);

  const fetchData = async () => {
    const studentData = await getStudents();
    const locationData = await getAllLocations();
    const attendanceData = await getAllAttendance();

    setLocations(locationData);

    const allData = attendanceData.map((attendance) => {
      const student = studentData.find((s) => s.id === attendance.RFID);
      const location = locationData.find(
        (l) => l.id === attendance.location_id
      );

      return {
        ...attendance,
        studentName: student?.name || "",
        studentNumber: student?.student_number || "",
        locationName: location?.name || "",
        timestamp: attendance.timestamp,
        formattedTimestamp: formatTimestamp(attendance.timestamp),
      };
    });

    // Sort the data by timestamp (newest first)
    const sortedData = allData.sort((a, b) =>
      compareTimestamps(b.timestamp, a.timestamp)
    );

    setStudents(sortedData);
    updateFilteredStudents(sortedData, showUniqueRecords);
  };

  const updateFilteredStudents = (data, uniqueMode) => {
    let filteredData = data.filter((student) => {
      const studentDate = new Date(parseThaiDateString(student.timestamp));
      const startDate = searchQuery.startDateTime
        ? new Date(searchQuery.startDateTime)
        : null;
      const endDate = searchQuery.endDateTime
        ? new Date(searchQuery.endDateTime)
        : null;

      return (
        (searchQuery.name
          ? student.studentName
              .toLowerCase()
              .includes(searchQuery.name.toLowerCase())
          : true) &&
        (searchQuery.studentId
          ? student.studentNumber.includes(searchQuery.studentId)
          : true) &&
        (searchQuery.location
          ? student.locationName
              .toLowerCase()
              .includes(searchQuery.location.toLowerCase())
          : true) &&
        (!startDate || studentDate >= startDate) &&
        (!endDate || studentDate <= endDate)
      );
    });

    if (uniqueMode) {
      const uniqueStudents = {};
      filteredData.forEach((student) => {
        if (
          !uniqueStudents[student.RFID] ||
          compareTimestamps(
            student.timestamp,
            uniqueStudents[student.RFID].timestamp
          ) > 0
        ) {
          uniqueStudents[student.RFID] = student;
        }
      });
      filteredData = Object.values(uniqueStudents);
    }

    filteredData.sort((a, b) => compareTimestamps(b.timestamp, a.timestamp));

    setFilteredStudents(filteredData);
  };

  const formatTimestamp = (timestamp) => {
    if (
      typeof timestamp !== "string" ||
      !timestamp.includes("[") ||
      timestamp == "00/00/0000[00:00:00]"
    ) {
      return "Error";
    }

    const [datePart, timePart] = timestamp.split("[");
    const [day, month, year] = datePart.split("/");
    const time = timePart.replace("]", "");

    return `${day}/${month}/${year} เวลา ${time}`;
  };

  const parseThaiDateString = (dateString) => {
    const [datePart, timePart] = dateString.split("[");
    const [day, month, year] = datePart.split("/");
    const [hours, minutes] = timePart.replace("]", "").split(":");
    return new Date(year, month - 1, day, hours, minutes);
  };

  const compareTimestamps = (a, b) => {
    if (typeof a !== "string" || typeof b !== "string") return 0;

    const dateA = parseThaiDateString(a);
    const dateB = parseThaiDateString(b);

    return dateA - dateB;
  };

  const handleSearch = () => {
    updateFilteredStudents(students, showUniqueRecords);
  };

  const handleReset = () => {
    setSearchQuery({
      name: "",
      studentId: "",
      location: "",
      startDateTime: "",
      endDateTime: "",
    });
    fetchData();
  };

  const handleInputChange = (e) => {
    setSearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggleUniqueMode = (checked) => {
    setShowUniqueRecords(checked);
    updateFilteredStudents(students, checked);
  };

  const deleteRecordFromFirebase = async (recordId) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "Attendance", recordId));

      console.log("Record deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting record: ", error);
      return false;
    }
  };

  const handleDeleteRecord = async (index, recordId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกนี้?")) {
      const deleteSuccessful = await deleteRecordFromFirebase(recordId);
      if (deleteSuccessful) {
        const updatedStudents = [...filteredStudents];
        updatedStudents.splice(index, 1);
        setFilteredStudents(updatedStudents);
        fetchData();
      } else {
        alert("เกิดข้อผิดพลาดในการลบบันทึก กรุณาลองอีกครั้ง");
      }
    }
  };


  return (
    <div className="flex flex-col w-full items-center justify-center p-5">
      <div className="text-5xl mb-8">Student Attendance Records</div>

      {/* Search and Filter Inputs */}
      <div class="search-container flex flex-col gap-4 mb-5">
        <div class="search-inputs flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by Student Name"
            name="name"
            class="border border-gray-300 rounded p-2 w-full mb-2"
            value={searchQuery.name}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <input
            type="text"
            placeholder="Search by Student ID"
            name="studentId"
            class="border border-gray-300 rounded p-2 w-full mb-2"
            value={searchQuery.studentId}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <select
            className="border border-gray-300 rounded p-2 w-full mb-2"
            value={searchQuery.location}
            onChange={(e) => {
              setSearchQuery({
                ...searchQuery,
                location: e.target.value,
              });
            }}
          >
            <option value="">เลือกสถานที่</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div class="date-pickers flex flex-wrap gap-2">
          <span class="ml-2 text-gray-500 text-sm">เวลาที่เริ่มต้น</span>
          <input
            type="datetime-local"
            name="startDateTime"
            class="border border-gray-300 rounded p-2 w-full mb-2"
            value={searchQuery.startDateTime}
            onChange={handleInputChange}
          />
          <span class="ml-2 text-gray-500 text-sm">เวลาที่สิ้นสุด</span>
          <input
            type="datetime-local"
            name="endDateTime"
            class="border border-gray-300 rounded p-2 w-full mb-2"
            value={searchQuery.endDateTime}
            onChange={handleInputChange}
          />
        </div>
        <div class="flex justify-between items-center">
          <button
            onClick={handleSearch}
            class="search-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full mx-2"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            class="reset-btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors w-full mx-2"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Unique Mode Toggle */}
      <div className="flex items-center space-x-2 mb-6">
        <Switch checked={showUniqueRecords} onChange={handleToggleUniqueMode} />
        <span className="text-sm font-medium text-gray-900">
          {showUniqueRecords ? "Showing Latest Records" : "Showing All Records"}
        </span>
      </div>

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-5 font-bold bg-gray-200 p-3 rounded-t-lg">
          <div>Student Name</div>
          <div>Student ID</div>
          <div>Location</div>
          <div>Timestamp</div>
          <div>Action</div>
        </div>

        <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
          {filteredStudents.map((student, index) => {
            // ตรวจสอบว่า formattedTimestamp ไม่ใช่ "Error" ก่อนแสดงผล
            if (student.formattedTimestamp !== "Error") {
              return (
                <div
                  key={index}
                  className="grid grid-cols-5 p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div>{student.studentName}</div>
                  <div>{student.studentNumber}</div>
                  <div>{student.locationName}</div>
                  <div>{student.formattedTimestamp}</div>
                  <div>
                    <button
                      onClick={() => handleDeleteRecord(index, student.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Record"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            }
            return null; // ถ้าเป็น Error ให้ return null เพื่อไม่แสดงแถว
          })}
        </div>
      </div>
    </div>
  );
}