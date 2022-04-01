import * as React from 'react';
import axios from 'axios';

import { SearchForm } from './SearchForm.tsx';
import { List } from './List.tsx';

import styled from 'styled-components';

import { ReactComponent as Check } from './check.svg';

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

const API_ENDPOINT = 'https://hacker-news.firebaseio.com/v0/topstories.json';

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

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

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

const App = () => {
  console.log('App renders');

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

  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
    console.log('setSearchTerm called');
  };

  const handleRemoveStory = (item: Story) => {
    
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

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
          onRemoveItem={handleRemoveStory}
        />
        </>
      )}
    </StyledContainer>
  );
};

export default App;

export { storiesReducer, SearchForm, List};

