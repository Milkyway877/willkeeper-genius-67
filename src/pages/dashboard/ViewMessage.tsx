
import React from 'react';
import { useParams } from 'react-router-dom';

const ViewMessage: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h2>View Message</h2>
      <p>Viewing message with ID: {id}</p>
    </div>
  );
};

export default ViewMessage;
