import {
  Box,
  Button,
  Checkbox,
  Editable,
  EditableInput,
  EditablePreview,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { sendPost } from "./App";
import Icon, { IconName } from "./Icon";
import NewItem, { Inputs } from "./NewItem";

import NoSleep from "nosleep.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RemoveItem from "./RemoveItem";

export interface ListItem {
  id: number;
  name: string;
  list_id: number;
  quantity: number;
  buyed: boolean;
  typeicon: IconName;
  created: Date;
  modified: Date;
}

interface Props {
  initialState: ListItem[];
  handleDelete: (itemIdentifier: { item_id: number; list_id: number }) => void;
  handleBuyed: (ListItemIdentifier: {
    item_id: number;
    list_id: number;
    buyed: boolean;
  }) => void;
  handleAddItem: (newItemData: Inputs) => void;
  handleEditItemName: (id: ListItem["id"], newName: ListItem["name"]) => void;
  handleEditItemQuantity: (
    id: ListItem["id"],
    newQuantity: ListItem["quantity"]
  ) => void;
}

const ShoppingList = ({
  initialState,
  handleDelete,
  handleBuyed,
  handleAddItem,
  handleEditItemName,
  handleEditItemQuantity,
}: Props) => {
  const [rows, updateRows] = useState(initialState);
  const [noSleepState, setNoSleepState] = useState<boolean>(false);

  useEffect(() => {
    let noSleep = new NoSleep();
    noSleepState ? noSleep.enable() : noSleep.disable();
    console.log(noSleep.isEnabled);
  }, [noSleepState]);

  useEffect(() => {
    updateRows(initialState);
  }, [initialState]);

  // Group by typeicons
  const typeiconGrouped = [...rows].sort((a, b) => {
    if (a.typeicon < b.typeicon) {
      return -1;
    }
    if (a.typeicon > b.typeicon) {
      return 1;
    }
    return 0;
  });

  // Sort by buyed
  const sortBuyed = [...typeiconGrouped].sort((a) => {
    if (a.buyed) return 1;
    if (!a.buyed) return -1;
    return 0;
  });

  return (
    <>
      <TableContainer maxHeight={"75vh"} overflowY={"auto"}>
        <Table variant="simple" size="sm">
          <Thead height={"3rem"}>
            <Tr>
              <Th></Th>
              <Th>Nazwa</Th>
              <Th>Ilość</Th>
              <Th>Typ</Th>
              <Th>
                <Menu>
                  <MenuButton as={Button} rightIcon={<Icon name={"FaCog"} />} />
                  <MenuList>
                    <MenuItem onClick={() => setNoSleepState(!noSleepState)}>
                      {noSleepState ? "Zawsze widoczny ✓" : "Zawsze widoczny"}
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        sendPost("/deleteManyItems", {
                          items_ids: rows.map((i) => i.id),
                        })
                          .then(() => {
                            updateRows([]);
                            toast.success("OK!");
                          })
                          .catch((err) => toast.error(err))
                      }
                    >
                      Usuń wszystko
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortBuyed.map((row) => (
              <Tr
                key={row.id}
                textDecoration={row.buyed ? "line-through" : "none"}
                opacity={row.buyed ? 0.5 : 1}
              >
                <Td>
                  <Checkbox
                    size="lg"
                    isChecked={row.buyed}
                    onChange={(e) => {
                      handleBuyed({
                        list_id: row.list_id,
                        item_id: row.id,
                        buyed: e.target.checked,
                      });
                    }}
                  ></Checkbox>
                </Td>
                <Td whiteSpace={"normal"}>
                  <Editable
                    defaultValue={row.name}
                    onSubmit={(value) => handleEditItemName(row.id, value)}
                  >
                    <EditablePreview />
                    <EditableInput />
                  </Editable>
                </Td>
                <Td>
                  <Editable
                    defaultValue={row.quantity.toString()}
                    onSubmit={(value) =>
                      handleEditItemQuantity(row.id, parseInt(value))
                    }
                  >
                    <EditablePreview></EditablePreview>
                    <Input as={EditableInput} type="number" />
                  </Editable>
                </Td>
                <Td>
                  <Icon name={row.typeicon}></Icon>
                </Td>
                <Td>
                  <RemoveItem
                    initSize="md"
                    handleDelete={() =>
                      handleDelete({ item_id: row.id, list_id: row.list_id })
                    }
                  ></RemoveItem>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Box position={"fixed"} bottom={"30px"} left={"50px"}>
        <NewItem
          handleAddItem={(itemData) => handleAddItem(itemData)}
        ></NewItem>
      </Box>

      <Box position={"fixed"} bottom={"30px"} right={"50px"}>
        <a href="/">
          <Button colorScheme="blue" size="lg" borderRadius="5px">
            <Icon name="FaArrowLeft"></Icon>
          </Button>
        </a>
      </Box>
    </>
  );
};

export default ShoppingList;
