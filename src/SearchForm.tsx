import * as React from 'react';

import styled from 'styled-components';

import { InputWithLabel } from './InputWithLabel.tsx';

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in;
  &:hover > svg > g {
    background: #171212;
    color: #ffffff;
  }
`;

const StyledItem = styled.li`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  a {
    color:inherit;
  }
  width: ${(props) => props.width};
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}: SearchFormProps) => {

  return(
    <div>
      <StyledSearchForm onSubmit={onSearchSubmit}>
        <InputWithLabel
          id="search"
          value={searchTerm}
          isFocused
          onInputChange={onSearchInput}
        >
          <strong>Search:</strong>
        </InputWithLabel>

        <StyledButtonLarge type="submit" disabled={!searchTerm}>
          Submit
        </StyledButtonLarge>
      </StyledSearchForm>
      <StyledSearchForm display="block" onSubmit={onSearchSubmit}>
        <StyledItem>
          <StyledColumn>
            <StyledButtonLarge type="submit">
              Search1
            </StyledButtonLarge>
          </StyledColumn>
          <StyledColumn>
            <StyledButtonLarge type="submit">
              Search2
            </StyledButtonLarge>
          </StyledColumn>
          <StyledColumn>
            <StyledButtonLarge type="submit">
              Search3
            </StyledButtonLarge>
           </StyledColumn>
          <StyledColumn>
            <StyledButtonLarge type="submit">
              Search4
            </StyledButtonLarge>
          </StyledColumn>
          <StyledColumn>
            <StyledButtonLarge type="submit">
             Search5
            </StyledButtonLarge>
          </StyledColumn>
        </StyledItem>
      </StyledSearchForm>
    </div>
  );
};

export { SearchForm };
