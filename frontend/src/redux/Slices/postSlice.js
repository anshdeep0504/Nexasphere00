import { createSlice } from '@reduxjs/toolkit'

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [],
        selectedPost: null,
        loading: true,
    },
    reducers: {
        setPosts:(state,action) => {
            state.posts = action.payload;
            state.loading = false;
        },
        setSelectedPost:(state,action) => {
            state.selectedPost = action.payload;
        },
        setPostsLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const {setPosts, setSelectedPost, setPostsLoading } = postSlice.actions;
export default postSlice.reducer;