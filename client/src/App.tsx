/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import useAuthenticate from './hooks/authenticate';

interface IDrink {
  id: number;
  name: string;
  description: string;
}

export const DrinkInspirationContext = createContext<IDrinks | null>(null);
export const MyDrinksContext = createContext<{
  myDrinks: Array<IDrink>;
  update: (drink: IDrink) => void;
} | null>(null);
export const AuthenticateContext = createContext<typeof useAuthenticate | null>(null);

function App() {
  const [drinkInspiration, setDrinkInspiration] = useState<IDrinks | null>(null);
  const [myDrinks, setMyDrinks] = useState<Array<IDrink>>([]);
  const authenticate = useAuthenticate();

  const updateMyDrinks = useCallback((drink: IDrink) => {
    setMyDrinks((prev) => [...prev, drink]);
  }, []);

  useEffect(() => {
    async function getMyDrinks() {
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticate.getJwt()}`,
        },
      });
      const json = await response.json();
      const data = await json;
      const myDrinks = data[0]['ElixirDrinks'].map((drink: IDrink) => ({
        id: drink.id,
        name: drink.name,
        description: drink.description,
      }));
      setMyDrinks(myDrinks);
    }
    if (authenticate.getJwt()) {
      getMyDrinks();
    }
  }, []);

  useEffect(() => {
    async function fetchDrinkInspiration() {
      const response = await fetch('/api/drink-inspiration', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticate.getJwt()}`,
        },
      });
      const data: IDrinks = await response.json();
      setDrinkInspiration(data);
    }

    if (authenticate.getJwt()) {
      fetchDrinkInspiration();
    }
  }, []);

  return (
    <div className={authenticate.isLoggedIn ? 'authorized-app' : 'not-authorized-app'}>
      <Navbar />
      <main>
        <MyDrinksContext.Provider value={{ myDrinks, update: updateMyDrinks }}>
          <DrinkInspirationContext.Provider value={drinkInspiration}>
            <Outlet />
          </DrinkInspirationContext.Provider>
        </MyDrinksContext.Provider>
      </main>
      <Footer />
    </div>
  );
}

export default App;
