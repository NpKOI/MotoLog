import React from 'react';
import Leaderboard from '../components/Leaderboard';
import UploadPhotoButton from '../components/UploadPhotoButton';

const Dashboard: React.FC = () => {
    // TODO: Replace with real data from API
    const users: any[] = [];

    return (
        <div className="dashboard">
            <h1>Leaderboard</h1>
            <Leaderboard users={users} />
            <UploadPhotoButton />
        </div>
    );
};

export default Dashboard;