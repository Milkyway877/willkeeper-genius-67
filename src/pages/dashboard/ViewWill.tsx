
import React from 'react';
import { useParams } from 'react-router-dom';

const ViewWill: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h2>View Will</h2>
      <p>Viewing will with ID: {id}</p>
    </div>
  );
};

export default ViewWill;
