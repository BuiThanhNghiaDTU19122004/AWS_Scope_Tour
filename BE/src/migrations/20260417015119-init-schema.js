'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('user', {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        user_name: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        phone_number: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        user_img: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        otp: {
          type: Sequelize.STRING,
          allowNull: true
        },
        otp_expiry: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.createTable('team', {
        team_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        group_img: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'user',
            key: 'user_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('Subject', {
        subject_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        team_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'team',
            key: 'team_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('task', {
        task_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'user',
            key: 'user_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        team_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'team',
            key: 'team_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        subject_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Subject',
            key: 'subject_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        status: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('task_completed', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        task_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'task',
            key: 'task_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'user_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        completed_date: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('team_member', {
        team_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'team',
            key: 'team_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        team_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'user',
            key: 'user_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        role: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: 'member'
        },
        joined_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('invitation_token', {
        token_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false
        },
        token: {
          type: Sequelize.STRING,
          allowNull: false
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        used: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        team_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'team',
            key: 'team_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('pet_shop', {
        pet_shop_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        pet_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        price: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        pet_img: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('pet', {
        pet_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'user_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        pet_type_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pet_shop',
            key: 'pet_shop_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        pet_name: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        level: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 1
        },
        experience: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        acquired_date: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        pet_img: {
          type: Sequelize.STRING(500),
          allowNull: true
        }
      }, { transaction });

      await queryInterface.createTable('pet_purchased', {
        purchase_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'user_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        pet_shop_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'pet_shop',
            key: 'pet_shop_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        purchase_date: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.createTable('streak', {
        streak_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'user_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        current_streak: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        longest_streak: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        last_completed_date: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('streak', { transaction });
      await queryInterface.dropTable('pet_purchased', { transaction });
      await queryInterface.dropTable('pet', { transaction });
      await queryInterface.dropTable('pet_shop', { transaction });
      await queryInterface.dropTable('invitation_token', { transaction });
      await queryInterface.dropTable('team_member', { transaction });
      await queryInterface.dropTable('task_completed', { transaction });
      await queryInterface.dropTable('task', { transaction });
      await queryInterface.dropTable('Subject', { transaction });
      await queryInterface.dropTable('team', { transaction });
      await queryInterface.dropTable('user', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
