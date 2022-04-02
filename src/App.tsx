//#######
//Imports
//#######
import * as React from 'react';
import axios from 'axios';

import { SearchForm } from './SearchForm.tsx';
import { List } from './List.tsx';

import styled from 'styled-components';

import { ReactComponent as Check } from './check.svg';

//#######
//Styling
//#######
const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color:#171212;
`;

const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

//#########################################################################
//Constants, Variables & Functions definition defined outside App component
//#########################################################################

//========================================
//Fetching data url with stories id's list
//========================================
const API_ENDPOINT = 'https://hacker-news.firebaseio.com/v0/topstories.json';

//===============================================
//Saves searchTerm on local storage (Client Side)
//===============================================
interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction = 
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const useSemiPersistentState = (
  key: string,
  initialState: string
 ): [string, (newValue: string) => void] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
    console.log('Search (input) value saved on local storage:');
    console.log(localStorage.getItem(key) || initialState);
  }, [value, key]);
  
  console.log('return from useSemiPersistentState');
  console.log(value);
  return [value, setValue];
};

//=========================
//Manages App state changes
//=========================
type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

const storiesReducer = (
  state: StoriesState,
  action: StoriesAction
) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      console.log('storiesReducer called. State update: data');
      console.log(action.payload);
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      console.log(action.payload);
      console.log(state.data);
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.id !== story.data.id
        ),
      };
    default:
      throw new Error();
  }
};

//#############
//App component
//#############
const App = () => {
  console.log('App renders');

//=====
//Hooks
//=====
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );
  
 /*const [sortOption, setSortOption] = useSemiPersistentState(
    'sort',
    ''
  );*/

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}`
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

//===========================================================================================
//Fetches individual stories by id, stores them in an array, and updates data in the app state
//===========================================================================================
  const getAsyncStories = async (fetchedIdList) => {
    console.log('1-Promise called');
    console.log(fetchedIdList.data);
    
    const storiesArray = [];

    await Promise.all (
      fetchedIdList.data.map(
        async (item) => {
          const story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${item}.json`);
          storiesArray.push(story);
          console.log(story);
        }
      )
    )
    console.log('Dispaching');
    console.log(storiesArray);

    dispatchStories({
      type: 'STORIES_FETCH_SUCCESS',
      payload: storiesArray,
    });

  };

//=======================================================================
//Fetches stories id's list from API, following an url change or an event
//=======================================================================
  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const fetchedIdList = await axios.get(url);
      console.log('Data fetched');
      console.log(fetchedIdList.data);

      await getAsyncStories(fetchedIdList);
      console.log('Data changed in state');

      //This useEffect doesn't work here. Gives an error - Why?
            /*React.useEffect(() => {
          getAsyncStories().then(result => {
            console.log(1);
            dispatchStories({
              type: 'STORIES_FETCH_SUCCESS',
              payload: result.stories.data,
            });
          });
      },[]);

      //This one also not - Why?
            /*React.useEffect(() => {
        console.log(Test use.Effect);
      },[]);*/


    } catch (error) {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
    }, [handleFetchStories]);

  /*const handleSort = (
    event: React.ChangeEvent<HTMLButtonElement>
   ) => {
    setSortOption(sortOption);
  };*/

//===============================================
//Changes searchTerm following input field change
//===============================================
  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
    console.log('setSearchTerm called');
  };

//================================
//Removes story from rendered list
//================================
  const handleRemoveStory = (item: Story) => {
    
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

//=========================================
//Changes url following submit button click
//=========================================
  const handleSearchSubmit = (
   event: React.FormEvent<HTMLFormElement>
  ) => {
    setUrl(`${API_ENDPOINT}`);

    event.preventDefault();
  };

  /*const setSort = React.useCallback(()) => {
    const [sort, setSort] = React.useState ([]);

    <List
      list={stories.data}
      sortList={sortType}
      onRemoveItem={handleRemoveStory}
    />
  }
  
  React.useEffect(()) => {
    setSort()
  }, [setSort]);*/

//===========
//renders App
//===========
  return (
    <StyledContainer>
      {console.log(stories.data)}
      {console.log(stories.isLoading)}
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />
      {stories.isError && <p>Something went wrong ...</p>}
      {console.log(stories.isLoading)}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <>
        {console.log(stories.data)}
        <List
          list={stories.data}
          searchTerm={searchTerm}
          onRemoveItem={handleRemoveStory}
        />
        </>
      )}
    </StyledContainer>
  );
};

//#######
//Exports
//#######
export default App;

export { storiesReducer, SearchForm, List};

