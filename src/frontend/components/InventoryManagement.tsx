import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fetchInventory, updateInventoryItem, addInventoryItem } from '../store/actions/inventoryActions';
import { InventoryItem } from '../types/InventoryItem';

// Define styles for inventory management components
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  table: {
    minWidth: 650,
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  addButton: {
    marginBottom: theme.spacing(2),
  },
  dialog: {
    padding: theme.spacing(2),
  },
}));

const InventoryManagement: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Set up state for inventory items, search query, and dialog open/close
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<InventoryItem>({
    sku: '',
    name: '',
    quantity: 0,
    location: '',
  });

  // Fetch inventory data using useEffect and fetchInventory action
  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  // Get inventory items from Redux store
  const storeInventoryItems = useSelector((state: any) => state.inventory.items);

  useEffect(() => {
    setInventoryItems(storeInventoryItems);
  }, [storeInventoryItems]);

  // Handler for filtering inventory items based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredItems = storeInventoryItems.filter(
      (item: InventoryItem) =>
        item.sku.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
    );
    setInventoryItems(filteredItems);
  };

  // Handler for updating inventory item quantity
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    dispatch(updateInventoryItem(itemId, { quantity: newQuantity }));
    setInventoryItems(
      inventoryItems.map((item) =>
        item.sku === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Handler for adding a new inventory item
  const handleAddItem = () => {
    dispatch(addInventoryItem(newItem));
    setInventoryItems([...inventoryItems, newItem]);
    handleCloseDialog();
  };

  // Handler for opening the add item dialog
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // Handler for closing the add item dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewItem({
      sku: '',
      name: '',
      quantity: 0,
      location: '',
    });
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      {/* Search field for inventory filtering */}
      <TextField
        className={classes.searchField}
        label="Search inventory"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Add Item button */}
      <Button
        className={classes.addButton}
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
      >
        Add Item
      </Button>

      {/* Table with inventory data */}
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.map((item) => (
              <TableRow key={item.sku}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleUpdateQuantity(item.sku, item.quantity + 1)}
                  >
                    Update Quantity
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add item dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} className={classes.dialog}>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="SKU"
            fullWidth
            value={newItem.sku}
            onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={newItem.location}
            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddItem} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;