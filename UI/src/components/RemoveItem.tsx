import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import Icon from "./Icon";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "full";

interface Props {
  initSize: Size;
  handleDelete: () => void;
}

const RemoveItem = ({ initSize, handleDelete }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState("md");

  const handleSizeClick = (size: Size) => {
    setSize(size);
    onOpen();
  };

  return (
    <>
      <Button size="s" onClick={() => handleSizeClick(initSize)}>
        <Icon name={"FaTrash"}></Icon>
      </Button>
      <Modal onClose={onClose} size={size} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Usuń element</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Trwale usunąć element z listy ?</ModalBody>
          <ModalFooter display={"flex"} justifyContent={"center"}>
            <Button colorScheme="red" onClick={handleDelete}>
              Usuń
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RemoveItem;
