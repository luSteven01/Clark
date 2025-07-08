import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import PrivateRoute from './Components/Routing/PrivateRoute';
import NavBarWrapper from './Components/Navbar/NavBarWrapper';

import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';

import { useUser } from './Components/context/UserContext';

import DessertPage from './Pages/Desserts/Desserts.js';
import AdminDesserts from './Pages/Desserts/AdminDesserts.js';

export default function Routing({ appProps }) {
  const { user, setUser } = useUser();
  const userIsAuthenticated = appProps.authenticated;
  const userIsMember =
    userIsAuthenticated &&
    user &&
    user.accessLevel === membershipState.MEMBER;
  const userIsOfficerOrAdmin =
    userIsAuthenticated &&
    user &&
    user.accessLevel >= membershipState.OFFICER;
  const signedInRoutes = [
    // new for Overview
    {
      Component: Overview,
      path: '/user-manager',
      allowedIf: userIsOfficerOrAdmin,
      redirect: '/',
      inAdminNavbar: true
    },
    //
    // {
    //   Component: EmailPage,
    //   path: '/email-list',
    //   allowedIf: userIsOfficerOrAdmin,
    //   redirect: '/',
    //   inAdminNavbar: true
    // },
    {
      Component: LedSign,
      path: '/led-sign',
      allowedIf: userIsOfficerOrAdmin,
      redirect: '/',
      inAdminNavbar: true
    },
    {
      Component: Printing,
      path: '/2DPrinting',
      allowedIf: userIsMember || userIsOfficerOrAdmin,
      redirect: '/login'
    },
    {
      Component: Login,
      path: '/login*',
      allowedIf: !userIsAuthenticated,
      redirect: '/',
      queryParams: {
        redirect: 'redirect',
      },
    },
    {
      Component: ForgotPassword,
      path: '/forgot',
      allowedIf: !userIsAuthenticated,
      redirect: '/'
    },
    {
      Component: MembershipApplication,
      path: '/register',
      allowedIf: !userIsAuthenticated,
      redirect: '/'
    },
    {
      Component: Profile,
      path: '/profile',
      allowedIf: userIsAuthenticated,
      redirect: '/login'
    },
    {
      Component: EditUserInfo,
      path: '/user/edit/:id',
      allowedIf: userIsOfficerOrAdmin,
      redirect: '/',
      inAdminNavbar: true
    },
    {
      Component: URLShortenerPage,
      path: '/short',
      allowedIf: userIsOfficerOrAdmin,
      inAdminNavbar: true,
      redirect: '/',
    },
    {
      Component: sendUnsubscribeEmail,
      path: '/unsub',
      allowedIf: userIsOfficerOrAdmin,
      inAdminNavbar: true,
      redirect: '/',
    },
    {
      Component: Messaging,
      path: '/messaging/:id?',
      allowedIf: userIsMember || userIsOfficerOrAdmin,
      redirect: '/login'
    },
    {
      Component: AdvertisementAdmin,
      path: '/advertisement-admin',
      allowedIf: userIsOfficerOrAdmin,
      redirect: '/',
      inAdminNavbar: true
    },
    {
      Component: CardReader,
      path: '/card-reader',
      allowedIf: userIsOfficerOrAdmin,
      redirect: '/',
      inAdminNavbar: true
    },
    {
      Component: AdminDesserts,
      path: '/dessert-admin',
      allowedIf: userIsOfficerOrAdmin,
      redirect:'/',
      inAdminNavbar: true
    }
  ];
  const signedOutRoutes = [
    { Component: Home, path: '/' },
    { Component: VerifyEmailPage, path: '/verify' },
    { Component: ResetPasswordPage, path: '/reset' },
    { Component: AboutPage, path: '/about'},
    { Component: ProjectsPage, path: '/projects'},
    { Component: EmailPreferencesPage, path: '/emailPreferences' },
    { Component: DessertPage, path: '/desserts'}
  ];
  return (
    <div>
      <Switch>
        {signedInRoutes.map(
          ({
            path,
            Component,
            allowedIf,
            redirect,
            inAdminNavbar,
            hideAdminNavbar = false,
          }, index) => {
            function getCorrectComponent(privateRouteProps) {
              if (hideAdminNavbar) {
                return <Component {...privateRouteProps} />;
              }
              return (<NavBarWrapper
                component={Component}
                enableAdminNavbar={inAdminNavbar}
                {...privateRouteProps}
              />);
            }
            return (
              <PrivateRoute
                key={index}
                exact
                path={path}
                appProps={{
                  allowed: allowedIf,
                  redirect,
                  authenticated:userIsAuthenticated,
                  ...appProps
                }}
                component={props => getCorrectComponent(props)}
              />
            );
          }
        )}
        {signedOutRoutes.map(({ path, Component }, index) => {
          return (
            <Route
              key={index}
              exact
              path={path}
              render={props => (
                <NavBarWrapper component={Component} {...props} {...appProps} />
              )}
            />
          );
        })}
        <Route component={NotFoundPage} />
      </Switch>
    </div>
  );
}
