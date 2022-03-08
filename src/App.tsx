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
  console.log(7);
  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

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
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.id !== story.id
        ),
      };
    default:
      throw new Error();
  }
};

const App = () => {
  console.log(8);
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

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);
      console.log(result.data);

      const storiesArray = [];

      const getAsyncStories = () => 
        Promise.resolve(
          result.data.map(
            item => (
              fetch (`https://hacker-news.firebaseio.com/v0/item/${item}.json`)
              .then (response => response.json())
              //.then (console.log(item))
              .then (story => {
                storiesArray.push(story)
              })
            )
          )
        );

      console.log(storiesArray);
      console.log(2);
      //This useEffect doesn't work here - Why?????
      /*React.useEffect(() => {
        console.log(3);
      }, []);*/

      //This one also not - Why?
      /*React.useEffect(() => {
          getAsyncStories().then(result => {
            console.log(1);
            dispatchStories({
              type: 'STORIES_FETCH_SUCCESS',
              payload: result.stories.data,
            });
          });
      },[]);
      console.log(4);*/

     
      getAsyncStories().then(() => {
        console.log(1);
        console.log(storiesArray);
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: storiesArray,
        });
      });

      console.log(5);
      

      //console.log(Stories);

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
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />
      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />
      )}
    </StyledContainer>
  );
};

export default App;

export { storiesReducer, SearchForm, List};

