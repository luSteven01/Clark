import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import './SearchModal.css';
import { officerOrAdminRoutes, signedOutRoutes, memberRoutes, notAuthenticatedRoutes } from '../../Routes';
import { membershipState } from '../../Enums';
import { getAllUsers } from '../../APIFunctions/User';
import { useUser } from '../context/UserContext';

export default function SearchModal({ appProps }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const prevKeyword = useRef('');
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([...signedOutRoutes]);
  const [selectItem, setSelectItem] = useState(0);
  const [users, setUsers] = useState([]);
  const { user } = useUser();
  const [errorMsg, setErrorMsg] = useState('');

  const routes = useMemo(() => {
    if (user.accessLevel === membershipState.MEMBER) return [...memberRoutes, ...signedOutRoutes];
    if (user.accessLevel >= membershipState.OFFICER) return [...officerOrAdminRoutes, ...signedOutRoutes];
    if (!appProps.authenticated) return [...notAuthenticatedRoutes, ...signedOutRoutes];
    return [...signedOutRoutes];
  }, [user.accessLevel, users]);

  /**
   * Helper function updates the keyword when the user types
   * @param e - The input change event
   */
  const handleChanges = (e) => {
    setKeyword(e.target.value);
    setSelectItem(0);
  };

  /** This helper function clears search box and all suggestions */
  const clearSearchModal = () => {
    setSuggestions([...signedOutRoutes]);
    setKeyword('');
  };

  const SuggestionsList = () => {
    if (suggestions.length === 0) return <></>;

    const topFiveItems = suggestions.slice(0, 5);
    return (
      <ul className='suggestion-list'>
        <p className='suggestion-item italic dark:text-gray-300'>Get Started</p>
        {topFiveItems.map((r, index) => ( // Still keep index to keep track of the selected item
          <li
            key={r.path} // Use r.path as key
            className={`suggestion-item ${index === selectItem ? 'active' : ''}`}
            onMouseEnter={() => setSelectItem(index)}
            onClick={() => {
              window.location.href = r.path;
              setOpen(false);
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>
              {r.type === 'user' ? '👤' : '📄'}
            </span>
            <div className='text-wrapper'>
              {r.pageName}
              <div className='hidden-tab'>
                {selectItem === index && `${window.location.origin}${r.path}`}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  /**
   * Async function fetches all user data from the API
   */
  const getUserData = async () => {
    try {
      const apiResponse = await getAllUsers({
        token: user.token,
        query: keyword,
        page: 0,
        sortColumn: 'firstName',
        sortOrder: 'asc'
      });
      if (!apiResponse.error) setUsers(apiResponse.responseData.items);
    } catch (error) {
      setErrorMsg(error);
    }
  };

  /**
   * An effect that instantly shows all hardcoded routes.
   * @dependencies keyword, routes, open
   */
  useEffect(() => {
    if (!open) return;

    // Return if keyword is blank
    if (!keyword) {
      setSuggestions([...signedOutRoutes]);
      return;
    }

    // Instantly display for the hardcoded page recommendations
    const routeMatches = routes.filter((r) =>
      r.pageName?.toLowerCase().includes(keyword.toLowerCase())
    );
    setSuggestions(routeMatches);
  }, [open, keyword, routes]);

  /**
   * A debounce function that performs the search 400ms after the user stops typing.
   * @dependencies keyword, open, user.accessLevel
   */
  useEffect(() => {
    if (!open ||
      !user.accessLevel ||
      user?.accessLevel < membershipState.OFFICER ||
      !keyword) return;

    const debounce = setTimeout(() => {
      // Only fetch users when there is a change in keyword
      if (prevKeyword.current !== keyword) {
        getUserData();
        prevKeyword.current = keyword; // Update previous keyword after fetching for new data
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [keyword, open, user.accessLevel]);

  /**
   * Combines hardcoded route suggestions with user search results
   * after the debounced fetch has updated the user list.
   * Only runs when the user list is updated, and search is open.
   * @dependencies open, users, keyword, routes, user.accessLevel
   */
  useEffect(() => {
    if (!open ||
      !user.accessLevel ||
      user.accessLevel < membershipState.OFFICER ||
      !keyword) return;

    const userMatches = users.filter((u) => {
      const searchKey = keyword.toLowerCase();
      return (
        u.firstName?.toLowerCase().includes(searchKey) ||
        u.lastName?.toLowerCase().includes(searchKey) ||
        u.email?.toLowerCase().includes(searchKey)
      );
    }).map((u) => ({
      pageName: `${u.firstName} ${u.lastName} (${u.email})`,
      path: `/user/edit/${u._id}`,
      type: 'user'
    }));

    setSuggestions(prev => [...prev, ...userMatches]);
  }, [open, users, keyword, routes, user.accessLevel]);

  /**
   * Executes a search when Enter is pressed
   * @dependencies selectItem, suggestions
   */
  const handleSearch = useCallback(() => {
    if (suggestions.length === 0) return; // Check if suggestions is empty

    const target = suggestions[selectItem];
    if (target && target.path) {
      window.location.href = target.path;
      setOpen(false);
      clearSearchModal();
    }
  }, [suggestions, selectItem]);

  /**
   * Listens for keyboard input and executes shortcut actions.
   * @dependencies open, suggestions, selectItem
   */
  useEffect(() => {
    const listener = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen(prev => !prev);
        if (!open) {
          clearSearchModal();
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
        clearSearchModal();
      } else if (e.key === 'Enter' && open) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (suggestions.length > 0) {
          const minLength = Math.min(suggestions.length - 1, 4);
          setSelectItem(prev => Math.min(prev + 1, minLength));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectItem(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [open, suggestions, selectItem]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  /**
   * Listens for mouse input and closes the search modal when the user clicks outside the modal content.
   * @dependencies open
   */
  useEffect(() => {
    function clickOut(e) {
      if (modalRef.current && !modalRef.current?.contains(e.target)) {
        setOpen(false);
        clearSearchModal();
      }
    }

    if (open) {
      window.addEventListener('mousedown', clickOut);
    }

    return () => {
      window.removeEventListener('mousedown', clickOut);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className='shortcut-search-modal'>
      <div ref={modalRef}>
        <div className='input-wrapper'>
          <input
            ref={inputRef}
            placeholder="Search here... (Ctrl + k)"
            value={keyword}
            onChange={handleChanges} />
          <SuggestionsList />
        </div>
        <div>
          {errorMsg && <p>{errorMsg}</p>}
        </div>
      </div>
    </div>
  );
}
