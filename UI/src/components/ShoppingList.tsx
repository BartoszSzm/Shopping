import {
  Box,
  Button,
  Checkbox,
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

export interface ListItemIdentifier {
  item_id: number;
  list_id: number;
}

interface Props {
  initialState: ListItem[];
  handleDelete: (itemIdentifier: ListItemIdentifier) => void;
  handleBuyed: (ListItemIdentifier: ListItemIdentifier) => void;
  handleAddItem: (newItemData: Inputs) => void;
}

const ShoppingList = ({
  initialState,
  handleDelete,
  handleBuyed,
  handleAddItem,
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
          <Thead>
            <Tr>
              <Th></Th>
              <Th>Nazwa</Th>
              <Th>Ilość</Th>
              <Th>Typ</Th>
              <Th></Th>
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
                    defaultChecked={row.buyed}
                    onChange={() =>
                      handleBuyed({ list_id: row.list_id, item_id: row.id })
                    }
                  ></Checkbox>
                </Td>
                <Td>{row.name}</Td>
                <Td>{row.quantity}</Td>
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

      <Box pos="fixed" bottom="30px" right="35px">
        <NewItem
          handleAddItem={(itemData) => handleAddItem(itemData)}
        ></NewItem>
      </Box>
    </>
  );
};

export default ShoppingList;
