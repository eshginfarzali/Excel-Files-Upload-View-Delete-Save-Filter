import { useState, useRef } from "react";
import {
  Upload,
  Button,
  Table,
  Input,
  Space,
  Alert,
  Modal,
  Select,
} from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import * as XLSX from "xlsx";

const { Option } = Select;

export const ExcelTable = () => {
  const [excelData, setExcelData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef();
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [formData, setFormData] = useState({ len: "", status: "" });

  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);

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
        setTypeError("Please select only excel file types");
        setExcelFile(null);
      }
    } else {
      setTypeError("Please select your file");
    }
  };

  const handleFileSubmit = (fileData) => {
    const workbook = XLSX.read(fileData, { type: "buffer" });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    setExcelData(data);
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
          key: key, // You can remove this line if you don't want to show the 'key' in the table
          width: "20%",
          ...getColumnSearchProps(key),
          sorter: (a, b) => (a[key] > b[key] ? 1 : -1),
        }))
      : [];

  const handleSave = () => {
    const newData = [...excelData];
    const index = newData.findIndex((item) => modalData.id === item.id);
    newData[index] = modalData;
    setExcelData(newData);
    setIsModalVisible(false);
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddData = () => {
    const newId = Math.max(...excelData.map((item) => item.id)) + 1;
    setExcelData([...excelData, { id: newId, ...formData }]);
    setIsAddModalVisible(false);
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
        <Button icon={<UploadOutlined />}>Load Excel File</Button>
      </Upload>
      <Button type="primary" onClick={showAddModal}>
        Add New Data
      </Button>
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
                        Save
                      </Button>
                      <Button
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => setEditingKey("")}
                      >
                        Cancel
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
                      >
                        Edit
                      </Button>
                      <Button
                        type="default"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                      >
                        Delete
                      </Button>
                    </Space>
                  )}
                </div>
              );
            },
          },
        ]}
        dataSource={excelData}
        pagination={true}
      />
      <Modal
        title="Edit Row"
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        {modalData &&
          Object.keys(modalData)
            .filter((key) => key !== "id") // Exclude the 'id' field
            .map((key) => (
              <div key={key}>
                <label>
                  {key}: <br />
                </label>
                {key === "status" ? (
                  <Select
                    style={{ width: 90 }}
                    value={modalData[key]}
                    onChange={(value) =>
                      setModalData({ ...modalData, [key]: value })
                    }
                  >
                    <Option value="0">0</Option>
                    <Option value="1">1</Option>
                    <Option value="2">2</Option>
                  </Select>
                ) : (
                  <Input
                    value={modalData[key]}
                    onChange={(e) =>
                      setModalData({ ...modalData, [key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
      </Modal>
      <Modal
        title="Add New Data"
        visible={isAddModalVisible}
        onOk={handleAddData}
        onCancel={() => setIsAddModalVisible(false)}
      >
        <div>
          <label>len:</label>
          <Input
            value={formData.len}
            onChange={(e) => setFormData({ ...formData, len: e.target.value })}
          />
        </div>
        <div>
          <label>status:</label>
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
          >
            <Option value="0">0</Option>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};
