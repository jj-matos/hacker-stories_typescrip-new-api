//#########
// Imports
//#########

import * as React from 'react';
import axios from 'axios';

import { SearchForm, StyledButtonLarge, StyledColumn } from './SearchForm.tsx';
import { List } from './List.tsx';

import styled from 'styled-components';

import { ReactComponent as Check } from './check.svg';

//#######
// Style
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

//################################################################
// Constants, Variables & Functions defined outside App component
//################################################################

//==========================================
// Fetching data url with stories id's list
//==========================================

const API_ENDPOINT = 'https://hacker-news.firebaseio.com/v0/topstories.json';

//=================================================
// Saves searchTerm on local storage (Client Side)
//=================================================

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
  initialState: string,
 ): [Array<string>, (newValue: Array<string>) => void] => {
  const [value, setValue] = React.useState([
    localStorage.getItem(key) || initialState
  ]);

  React.useEffect(() => {
    localStorage.setItem(key, value[value.length -1]);
    console.log('Search (input) value saved on local storage:');
    console.log(localStorage.getItem(key) || initialState);
  }, [value, key]);
  
  console.log('return from useSemiPersistentState');
  console.log(value);
  return [value, setValue];
};

//===========================
// Manages App state changes
//===========================

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

const getLastSubmits = (submits) => submits.slice(-5);

//###############
// App component
//###############

const App = () => {
  console.log('App renders');

//=======
// Hooks
//=======

  const [searches, setSearches] = useSemiPersistentState(
    'search',
    'React'
  );

  const [submits, setSubmits] = React.useState([]);

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}`
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

//============================================================
// Fetches individual stories by id, stores them in an array,
// and updates data in the app state
//============================================================

  const getAsyncStories = async (fetchedIdList) => {
    console.log('Promise called:');
    console.log(fetchedIdList.data);
    
    const storiesArray = [];

    await Promise.all (
      fetchedIdList.data.map(
        async (item) => {
          const story = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${item}.json`);
          storiesArray.push(story);
        }
      )
    )
    console.log('Dispaching:');
    console.log(storiesArray);

    dispatchStories({
      type: 'STORIES_FETCH_SUCCESS',
      payload: storiesArray,
    });

  };

//====================================================
// Fetches stories id's list from API, 
// following an url change or an event,
// and updates state data with individual items array
// referenced to the id's in the initial id's list
//====================================================

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const fetchedIdList = await axios.get(url);
      console.log('Data fetched:');
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
  }, [submits]);

  React.useEffect(() => {
    handleFetchStories();
    }, [handleFetchStories]);

  /*const handleSort = (
    event: React.ChangeEvent<HTMLButtonElement>
   ) => {
    setSortOption(sortOption);
  };*/

//=================================================
// Changes searchTerm following input field change
//=================================================

  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearches(searches.concat(event.target.value));
    console.log('setSearches called');
  };

//==================================
// Removes story from rendered list
//==================================

  const handleRemoveStory = (item: Story) => {
    
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

//=======================================
// Handles submit button click triggers:
// - Fetches id list from url
// - Saves search to be rendered with 
//   previous searches buttons
//=======================================

  const handleSearchSubmit = (
   event: React.FormEvent<HTMLFormElement>
  ) => {
    
    setSubmits(submits.concat(lastSearch));

    handleSearch(lastSearch);

    event.preventDefault();
  };

//=======================
// Handles last searches 
//=======================

  const handlePreviousSearch = (searchTerm) => {
    handleSearch(searchTerm);
  };

//##################
// Handles searches
//##################

  const handleSearch = (searchTerm) => {
    setSearches(searches.concat(searchTerm));
  };

  const lastSubmits = getLastSubmits(submits);
  const lastSearch = searches[searches.length - 1];

//=============
// Renders App
//=============

  return (
    <StyledContainer>
      {console.log(stories.data)}
      {console.log(stories.isLoading)}
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={lastSearch}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {lastSubmits.map((searchTerm, index) => (
        <StyledColumn>
          <StyledButtonLarge
            key={searchTerm+index}
            type="button"
            onClick={() => handlePreviousSearch(searchTerm)}
          >
            {searchTerm}
          </StyledButtonLarge>
        </StyledColumn>
      ))}

      <hr />
      {stories.isError && <p>Something went wrong ...</p>}
      {console.log(stories.isLoading)}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <>
        {console.log(stories.data)}
        {console.log(lastSearch)}
        <List
          list={stories.data}
          searchTerm={lastSearch}
          onRemoveItem={handleRemoveStory}
        />
        </>
      )}
    </StyledContainer>
  );
};

//#########
// Exports
//#########

export default App;

export { storiesReducer, SearchForm, List};

