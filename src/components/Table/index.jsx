import { useState, useRef } from "react";
import { Upload, Button, Table, Input, Space, Alert } from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import * as XLSX from "xlsx";
import faker from 'faker';
import { AddEditModal } from "../Modal";
import { BarChart, PieChart } from "../Chart";


export const ExcelTable = () => {
  const [excelData, setExcelData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef();
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [formData, setFormData] = useState({ len: "", status: "" });
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);

  const handleDelete = (record) => {
    const updatedData = excelData.filter((item) => item.id !== record.id);
    setExcelData(updatedData);
  };

  const handleFile = (e) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.fileList[0]?.originFileObj;

    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
          handleFileSubmit(e.target.result);
        };
      } else {
        setTypeError("Please select Excel file types only.");
        setExcelFile(null);
      }
    } else {
      setTypeError("Select your file.");
    }
  };

  const handleFileSubmit = (fileData) => {
    const workbook = XLSX.read(fileData, { type: "buffer" });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const maxId = Math.max(...excelData.map((item) => item.id), 0);

    const newData = data.map((item, index) => ({
      ...item,
      id: maxId + 1 + index,
    }));

    setExcelData(newData);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex] &&
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns =
    excelData.length > 0
      ? Object.keys(excelData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key: key,
          width: "20%",
          ...getColumnSearchProps(key),
          sorter: (a, b) => (a[key] > b[key] ? 1 : -1),
        }))
      : [];

  const showPieChart = () => {
    const status0LenTotal = excelData.reduce(
      (total, item) => (item.status === 0 ? total + item.len : total),
      0
    );
    const status1LenTotal = excelData.reduce(
      (total, item) => (item.status === 1 ? total + item.len : total),
      0
    );
    const status2LenTotal = excelData.reduce(
      (total, item) => (item.status === 2 ? total + item.len : total),
      0
    );

   
    const pieChartData = {
      labels: ["Status 0", "Status 1", "Status 2"],
      label: '# of Votes',
      datasets: [
        {
          label: "Len Cemi",
          data: [status0LenTotal, status1LenTotal, status2LenTotal],
          backgroundColor: ["#FF5733", "#33FF57", "#3366FF"],
        },
      ],
    };
    setPieChartData(pieChartData);
  };

  const showBarChart = () => {
    const status0Count = excelData.filter((item) => item.status === 0).length;
    const status1Count = excelData.filter((item) => item.status === 1).length;
    const status2Count = excelData.filter((item) => item.status === 2).length;

    const barChartData = {
      datasets: [
        {
          label: 'Satus 0',
          data: status0Count,
          backgroundColor: 'rgb(218, 31, 31)',
        },
        {
          label: 'Satus 1',
          data: status1Count,
          backgroundColor: 'rgb(51, 211, 23)',
        },
        {
          label: 'Satus 2',
          data: status2Count,
          backgroundColor: 'rgb(53, 162, 235)',
        },
      ],
    }
    setBarChartData(barChartData)
  };

  const generateUniqueId = (data) => {
    const maxId = Math.max(...data.map((item) => item.id), 0);
    return maxId + 1;
  };

  let modalDataCopy = modalData;

  const handleSave = () => {
    const newData = [...excelData];
    if (modalDataCopy === null) {
      const newId = generateUniqueId(newData);
      modalDataCopy = { id: newId, len: formData.len, status: formData.status };
      newData.push(modalDataCopy);
    } else {
      const index = newData.findIndex((item) => modalDataCopy.id === item.id);
      newData[index] = modalDataCopy;
    }
    setExcelData(newData);
    setIsModalVisible(false);
  };

  const showAddModal = () => {
    setIsModalVisible(true);
    setModalData(null);
  };

  return (
    <div>
      {typeError && <Alert message={typeError} type="error" showIcon />}
      <Upload
        name="file"
        accept=".xlsx"
        maxCount={1}
        fileList={[]}
        onChange={handleFile}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined/>}>Load Excel File</Button>
      </Upload>
      {excelData.length > 0 && (
        <Button type="primary" onClick={showAddModal}>
          New Add Data
        </Button>
      )}
      <Table
        columns={[
          ...columns,
          {
            dataIndex: "actions",
            render: (_, record) => {
              const editable = record.id === editingKey;
              return (
                <div>
                  {editable ? (
                    <Space>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleSave}
                      >
                        Kaydet
                      </Button>
                      <Button
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => setEditingKey("")}
                      >
                        İptal
                      </Button>
                    </Space>
                  ) : (
                    <Space>
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setModalData(record);
                          setIsModalVisible(true);
                        }}
                      ></Button>
                      <Button
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                      ></Button>
                      <Button
                        type="default"
                        icon={<EnvironmentOutlined />}
                      ></Button>
                    </Space>
                  )}
                </div>
              );
            },
          },
        ]}
        dataSource={excelData.map((item) => ({ ...item, key: item.id }))}
        pagination={true}
      />

      <Button
        type="default"
        icon={<PieChartOutlined />}
        onClick={showPieChart}
      >
        Analiz 1
      </Button>
      <Button
        type="default"
        icon={<BarChartOutlined />}
        onClick={showBarChart}
      >
        Analiz 2
      </Button>
      {barChartData && <BarChart data={barChartData} />}
      {pieChartData && <PieChart data={pieChartData} />}
      <AddEditModal
        isModalVisible={isModalVisible}
        handleSave={handleSave}
        handleCancel={() => setIsModalVisible(false)}
        modalData={modalData}
        setModalData={setModalData}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};
