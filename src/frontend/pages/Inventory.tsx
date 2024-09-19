import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fetchInventory, updateInventoryItem, addInventoryItem } from '../store/actions/inventoryActions';
import { RootState } from '../store/types';
import { InventoryItem } from '../types/InventoryItem';

// Define styles for the component
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
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
}));

const Inventory: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const inventoryItems = useSelector((state: RootState) => state.inventory.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<InventoryItem>({
    id: '',
    name: '',
    quantity: 0,
    price: 0,
  });

  // Fetch inventory data on component mount
  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  // Update filtered inventory when inventory items or search query changes
  useEffect(() => {
    const filtered = inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [inventoryItems, searchQuery]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await dispatch(updateInventoryItem(itemId, { quantity: newQuantity }));
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // TODO: Add error handling UI
    }
  };

  const handleAddItem = async () => {
    try {
      await dispatch(addInventoryItem(newItem));
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to add item:', error);
      // TODO: Add error handling UI
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewItem({ id: '', name: '', quantity: 0, price: 0 });
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Inventory Management
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            className={classes.searchField}
            label="Search Inventory"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            className={classes.addButton}
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
          >
            Add New Item
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="inventory table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell component="th" scope="row">
                      {item.name}
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      >
                        -
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
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
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value, 10) })}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
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

export default Inventory;

// TODO: Implement pagination for large inventory lists
// TODO: Add error handling UI for failed API requests
// TODO: Implement form validation for adding new items
// TODO: Add confirmation dialog for deleting items
// TODO: Implement sorting functionality for inventory table columns