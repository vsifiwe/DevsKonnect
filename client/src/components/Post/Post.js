import React, { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import PostItem from '../Posts/PostItem';
import CommentForm from '../Post/CommentForm';
import { getPost } from '../../actions/post';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const Post = ({ getPost, post: { post, loading }, match }) => {
    useEffect(() => {
        getPost(match.params.id);
    }, [getPost]);
    return loading || post === null ? (
        <Spinner />
    ) : (
        <Fragment>
            <Link to='/posts' className='btn'>
                Back To Posts
            </Link>
            <PostItem post={post} showActions={false} />
            <CommentForm postID={post._id} />
        </Fragment>
    );
};

Post.propTypes = {
    getPost: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    post: state.post,
});

export default connect(mapStateToProps, { getPost })(Post);
