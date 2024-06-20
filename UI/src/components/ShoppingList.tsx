import {
  Box,
  Button,
  Checkbox,
  Editable,
  EditableInput,
  EditablePreview,
  Input,
  Link,
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
import Icon, { IconName } from "./Icon";
import NewItem, { Inputs } from "./NewItem";

import "react-toastify/dist/ReactToastify.css";

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
      <TableContainer>
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
                    <MenuItem>Wygasanie ekranu</MenuItem>
                    <MenuItem>Usuń wszystko</MenuItem>
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
                <Td>
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
                  <Button
                    size="s"
                    onClick={() =>
                      handleDelete({ item_id: row.id, list_id: row.list_id })
                    }
                  >
                    <Icon name={"FaTrash"}></Icon>
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Box pos="fixed" bottom="100px" right="35px">
        <NewItem
          handleAddItem={(itemData) => handleAddItem(itemData)}
        ></NewItem>
      </Box>

      <Box pos="fixed" bottom="100px" left="35px">
        <Link href="/">
          <Button colorScheme="blue" size="lg" borderRadius="5px">
            <Icon name="FaArrowLeft"></Icon>
          </Button>
        </Link>
      </Box>
    </>
  );
};

export default ShoppingList;
