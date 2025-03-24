import React from "react";

const Profile = ({ profile }) => {
  return (
    <div className="box">
      <h2 className="subtitle">Your Profile</h2>
      <p>
        <strong>Display Name:</strong> {profile.displayName}
      </p>
      <p>
        <strong>Bio:</strong> {profile.bio}
      </p>
    </div>
  );
};

export default Profile;
