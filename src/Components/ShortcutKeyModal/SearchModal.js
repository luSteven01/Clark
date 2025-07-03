import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
// import style from './SearchModal.module.css';
import { officerOrAdminRoutes, signedOutRoutes, memberRoutes, notAuthenticatedRoutes } from '../../Routes';
import { membershipState } from '../../Enums';
import { getAllUsers } from '../../APIFunctions/User';
import { useUser } from '../context/UserContext';

export default function SearchModal({ appProps }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
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

  function handleChanges(e) {
    setKeyword(e.target.value);
    setSelectItem(0);
  }

  function getSuggestions() {
    if (suggestions.length === 0) return <></>;

    return (
          <ul className='suggestion-list'>
            {suggestions.map((r, index) => (
              <li
                key={index}
                className={`'suggestion-item' ${index === selectItem ? 'active' : ''}`}
                onMouseEnter={() => setSelectItem(index)}
                onClick={() => {
                  window.location.href = r.path;
                  setOpen(false);
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>
                  {r.type === 'user' ? '👤' : '📄'}
                </span>
                {r.pageName}
                <div className='hidden-tab'>{selectItem === index && `${window.location.origin}${r.path}`}</div>
              </li>
            )).slice(0, 5)}
          </ul>
    )
  }

  async function getUserData() {
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
  }

  /**
   * An effect that instantly shows all hardcoded routes.
   * @dependencies keyword, routes, open
   */
  useEffect(() => {
    if (!open) return;

    // Return if keyword is blank
    if (!keyword) {
      setSuggestions([]);
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
    const target = suggestions[selectItem];

    if (target && target.path) {
      window.location.href = target.path;
      setOpen(false);
    }

  }, [suggestions, selectItem]);

  useEffect(() => {
    const listener = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || (e.key === 'K'))) {
        e.preventDefault();
        setOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'Enter' && open) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (suggestions.length > 0) setSelectItem(prev => Math.min(prev + 1, suggestions.length - 1));
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

  if (!open) return null;

  return (
    <div className='search-modal'>
      <div className='input-wrapper'>
        <input
          ref={inputRef}
          placeholder="Search here"
          value={keyword}
          onChange={handleChanges} />

        {getSuggestions()}

        {/* {suggestions.length > 0 && (
          <ul className={`${style['suggestion-list']}`}>
            {suggestions.map((r, index) => (
              <li
                key={index}
                className={`${style['suggestion-item']} ${index === selectItem ? style['active'] : ''}`}
                onMouseEnter={() => setSelectItem(index)}
                onClick={() => {
                  window.location.href = r.path;
                  setOpen(false);
                }}
              >

                <span style={{ marginRight: '0.5rem' }}>
                  {r.type === 'user' ? '👤' : '📄'}
                </span>
                {r.pageName}
                <div className={style['hidden-tab']}>{selectItem === index && r.path}</div>
              </li>
            ))}
          </ul>
        )} */}
      </div>
      <div>
        {errorMsg && <p>{errorMsg}</p>}
      </div>
    </div>
  );
}
