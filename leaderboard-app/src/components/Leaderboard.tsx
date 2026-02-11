import React from 'react';
import UserAvatar from './UserAvatar';
import './leaderboard.css';

interface LeaderboardProps {
    users: any[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <ul>
                {users.map((user: any) => (
                    <li key={user.id} className="leaderboard-item">
                        <UserAvatar imageUrl={user.profilePicture} />
                        <span className="username">{user.username}</span>
                        <span className="score">{user.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;