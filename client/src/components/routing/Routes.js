import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import Alert from '../layout/Alert';
import Dashboard from '../dashboard/Dashboard';
import PrivateRoute from '../routing/PrivateRoute';
import CreateProfile from '../profile-form/CreateProfile';
import EditProfile from '../profile-form/EditProfile';
import Profiles from '../Profiles/Profiles';
import Profile from '../Profile/Profile';
import Posts from '../Posts/Posts';
import Post from '../Post/Post';
import NotFound from '../layout/NotFound';
import AddExperience from '../profile-form/AddExperience';
import AddEducation from '../profile-form/AddEducation';

export const Routes = () => {
    return (
        <section className='container'>
            <Alert />
            <Switch>
                <Route exact path='/register' component={Register} />
                <Route exact path='/login' component={Login} />
                <Route exact path='/profiles' component={Profiles} />
                <Route exact path='/profile/:id' component={Profile} />
                <PrivateRoute exact path='/dashboard' component={Dashboard} />
                <PrivateRoute
                    exact
                    path='/create-profile'
                    component={CreateProfile}
                />
                <PrivateRoute
                    exact
                    path='/edit-profile'
                    component={EditProfile}
                />
                <PrivateRoute
                    exact
                    path='/add-experience'
                    component={AddExperience}
                />
                <PrivateRoute
                    exact
                    path='/add-education'
                    component={AddEducation}
                />
                <PrivateRoute exact path='/posts' component={Posts} />
                <PrivateRoute exact path='/post/:id' component={Post} />
                <Route component={NotFound} />
            </Switch>
        </section>
    );
};
