import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Inputs } from "./NewItem";
import ShoppingList, { ListItem } from "./ShoppingList";

interface NewListItem extends Inputs {
  list_id: number;
}

const App = () => {
  const [data, setData] = useState<ListItem[]>([]);
  const [listID, setListId] = useState<number>(0);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchData = (interval: number) => {
    axios
      .get(API_URL + "/1")
      .then((response) => {
        setData(response.data.list_items);
        setListId(response.data.list_id);
      })
      .catch(() => {
        alert("Backend connection error");
        clearInterval(interval);
      });
  };

  const markAsBuyed = (data: {
    item_id: number;
    list_id: number;
    buyed: boolean;
  }) => {
    axios.post(API_URL + "/buyed", data).catch((e) => alert(e));
  };

  const markAsDeleted = (data: { item_id: number; list_id: number }) => {
    axios.post(API_URL + "/delete", data).catch((e) => alert(e));
  };

  const addNewItem = (data: NewListItem) => {
    axios
      .post(API_URL + "/new", data)
      .then((data) => {
        console.log(data.data);
        if (data.data.errors) {
          toast.error(data.data.errors);
        } else {
          toast.success("OK!");
        }
      })
      .catch((e) => toast.error(e));
  };

  useEffect(() => {
    const interval = setInterval(() => fetchData(interval), 700);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <ShoppingList
        initialState={data}
        handleDelete={(itemIdentifier) => markAsDeleted(itemIdentifier)}
        handleBuyed={(itemIdentifier) => markAsBuyed(itemIdentifier)}
        handleAddItem={(itemData) =>
          console.log(addNewItem({ ...itemData, list_id: listID }))
        }
      ></ShoppingList>
      <ToastContainer></ToastContainer>
    </>
  );
};

export default App;
