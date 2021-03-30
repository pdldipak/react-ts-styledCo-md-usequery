import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
//Components
import Drawer from '@material-ui/core/Drawer';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Badge from '@material-ui/core/Badge';
import { StyledButton, Wrapper } from './App.styles';
import Item from './components/item/Item';
import Cart from './components/cart/Cart';

//Types
export type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;
  amount: number;
};

const getProducts = async (): Promise<CartItemType[]> => {
  const res = await fetch('https://fakestoreapi.com/products');
  const data = await res.json();
  return data;
};

const App: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    const localData = localStorage.getItem('cartItems');
    if (localData) {
      setCartItems(JSON.parse(localData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  //useQuery on left takes two first data and another status:success, isLoading, error and
  // on right first short description of string and async function name

  const { data, isLoading, error } = useQuery<CartItemType[]>(
    'products',
    getProducts
  );
  const getTotalItems = (items: CartItemType[]) => {
    return items.reduce((ac: number, item) => ac + item.amount, 0);
  };

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems((prev) => {
      //is the item already added in the cart
      const isItemInCart = prev.find(
        (item) => item.id === clickedItem.id
      );
      if (isItemInCart) {
        return prev.map((item) =>
          item.id === clickedItem.id
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }
      //first time item is added
      return [...prev, { ...clickedItem, amount: 1 }];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems((prev) =>
      prev.reduce((ac, item) => {
        if (item.id === id) {
          if (item.amount === 1) return ac;
          return [...ac, { ...item, amount: item.amount - 1 }];
        } else {
          return [...ac, item];
        }
      }, [] as CartItemType[])
    );
  };

  // if (isLoading) return <LinearProgress />;
  // if (error) return <div>Something went wrong ...</div>;

  return (
    <>
      {isLoading && <LinearProgress />}
      {error && <div>Something went wrong ...</div>}
      <Wrapper>
        <Drawer
          anchor='right'
          open={cartOpen}
          onClose={() => setCartOpen(false)}
        >
          <Cart
            cartItems={cartItems}
            addToCart={handleAddToCart}
            removeFromCart={handleRemoveFromCart}
          />
        </Drawer>
        <StyledButton onClick={() => setCartOpen(true)}>
          <Badge
            badgeContent={getTotalItems(cartItems)}
            color='error'
          >
            <AddShoppingCartIcon />
          </Badge>
        </StyledButton>

        <Grid container spacing={3}>
          {data?.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Item item={item} handleAddToCart={handleAddToCart} />
            </Grid>
          ))}
        </Grid>
      </Wrapper>
      <ReactQueryDevtools
        initialIsOpen={false}
        position='bottom-right'
      />
    </>
  );
};

export default App;
