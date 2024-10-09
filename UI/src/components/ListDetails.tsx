import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { sendPost } from "./App";
import { Inputs } from "./NewItem";
import ShoppingList, { ListItem } from "./ShoppingList";

interface NewListItem extends Inputs {
  list_id: number;
}

const ListDetails = () => {
  const [data, setData] = useState<ListItem[]>([]);
  const [listID, setListId] = useState<number>(0);
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  let { listId } = useParams();

  const fetchData = (interval: number) => {
    axios
      .get(API_URL + `/${listId}`)
      .then((response) => {
        setData(response.data.list_items);
        setListId(response.data.list_id);
      })
      .catch((err) => {
        toast.error(err);
        clearInterval(interval);
      });
  };

  const markAsBuyed = (data: {
    item_id: number;
    list_id: number;
    buyed: boolean;
  }) => {
    axios.post(API_URL + "/buyed", data).catch((err) => toast.error(err));
  };

  const markAsDeleted = (data: { item_id: number; list_id: number }) => {
    axios.post(API_URL + "/delete", data).catch((err) => toast.error(err));
  };

  const addNewItem = (data: NewListItem) => {
    axios
      .post(API_URL + "/newItem", data)
      .then((data) => {
        if (data.data.errors) {
          toast.error(data.data.errors);
        } else {
          toast.success("OK!");
        }
      })
      .catch((err) => toast.error(err));
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
          addNewItem({ ...itemData, list_id: listID })
        }
        handleEditItemName={(id, name) =>
          sendPost("/updateItem", { id: id, name: name })
            .then(() => toast.success("OK!"))
            .catch((err) => toast.error(err))
        }
        handleEditItemQuantity={(id, quantity) =>
          sendPost("/updateItem", { id: id, quantity: quantity })
            .then(() => toast.success("OK!"))
            .catch((err) => toast.error(err))
        }
      ></ShoppingList>
      <ToastContainer position="bottom-right"></ToastContainer>
    </>
  );
};

export default ListDetails;
