import {
  Box,
  Button,
  Card,
  CardHeader,
  Heading,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import NewItem from "./NewItem";

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface List {
  id: number;
  name: string;
}

export async function sendPost(endpoint: string, data: object): Promise<any> {
  const response = await axios.post(API_URL + endpoint, data);
  return response.data;
}

const App = () => {
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    axios
      .get(API_URL + "/lists")
      .then((response) => setLists(response.data))
      .catch((err) => toast.error(err));
  }, []);

  return (
    <>
      <Box
        marginTop={"1.5rem"}
        marginBottom={"1.5rem"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Heading marginRight={"1rem"}>Lists</Heading>
        <NewItem
          handleAddItem={(itemData) => {
            sendPost("/newList", itemData)
              .then((msg) => {
                if (msg.status == "confirmed") {
                  window.location.reload();
                } else {
                  toast.error(msg.msg);
                }
              })
              .catch((err) => toast.error(err));
          }}
          withNumberStepper={false}
        ></NewItem>
      </Box>
      <Stack spacing="4" width={"80%"} gap={"2rem"} margin={"auto"}>
        {lists.map((list) => (
          <Card>
            <CardHeader
              display={"flex"}
              justifyContent={"space-between"}
              alignContent={"center"}
            >
              <Link href={`/${list.id}`}>
                <Heading size="md"> {list.name}</Heading>
              </Link>
              <Box>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<FaChevronDown />}
                  ></MenuButton>
                  <MenuList>
                    <MenuItem
                      color={"red"}
                      onClick={() => {
                        sendPost("/deleteList", { id: list.id }).then(() =>
                          setLists(lists.filter((l) => l.id !== list.id))
                        );
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </CardHeader>
          </Card>
        ))}
      </Stack>
      <ToastContainer position="bottom-right"></ToastContainer>
    </>
  );
};

export default App;
